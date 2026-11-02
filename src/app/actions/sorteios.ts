"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { regrasDoClube } from "@/lib/clube";

const SorteioSchema = z
  .object({
    titulo: z.string().trim().min(3, "Dê um nome ao sorteio."),
    premio: z.string().trim().min(3, "Descreva o prêmio."),
    nivelMinimo: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v !== "" ? v : null)),
    inicioEm: z.string().min(1, "Informe o início do período."),
    fimEm: z.string().min(1, "Informe o fim do período."),
  })
  .refine((d) => new Date(d.fimEm) >= new Date(d.inicioEm), {
    message: "O fim do período não pode ser antes do início.",
    path: ["fimEm"],
  });

export type EstadoSorteio = { ok?: boolean; erro?: string };

/**
 * Quem concorre: paciente com sessão concluída dentro da janela.
 *
 * Estar no Clube não basta — a direção quis premiar quem se tratou naquele
 * mês. O sorteio de outubro é entre quem veio em outubro, mesmo que alguém
 * com saldo maior esteja parado desde setembro.
 */
async function elegiveis(sorteio: {
  inicioEm: Date;
  fimEm: Date;
  nivelMinimo: string | null;
}) {
  const pacientes = await db.paciente.findMany({
    where: {
      agendamentos: {
        some: {
          status: "CONCLUIDO",
          inicio: { gte: sorteio.inicioEm, lte: sorteio.fimEm },
        },
      },
    },
    select: {
      id: true,
      pontos: true,
      usuario: { select: { nome: true } },
    },
    orderBy: { usuario: { nome: "asc" } },
  });

  if (!sorteio.nivelMinimo) return pacientes;

  // Faixa mínima: o corte vem da tabela, não de um número solto aqui
  const regras = await regrasDoClube();
  const faixa = regras.niveis.find((n) => n.nome === sorteio.nivelMinimo);
  if (!faixa) return pacientes;

  return pacientes.filter((p) => p.pontos >= faixa.minimo);
}

/** Lista quem está concorrendo agora — a tela usa para mostrar antes de apurar. */
export async function participantesDe(id: string) {
  const s = await db.sorteio.findUnique({ where: { id } });
  if (!s) return [];
  return elegiveis(s);
}

export async function criarSorteio(
  _estado: EstadoSorteio,
  formData: FormData
): Promise<EstadoSorteio> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = SorteioSchema.safeParse({
    titulo: formData.get("titulo"),
    premio: formData.get("premio"),
    nivelMinimo: formData.get("nivelMinimo") ?? undefined,
    inicioEm: formData.get("inicioEm"),
    fimEm: formData.get("fimEm"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const d = parsed.data;
  const inicio = new Date(`${d.inicioEm}T00:00:00`);
  // Até o fim do dia, senão quem se tratou na data final ficaria de fora
  const fim = new Date(`${d.fimEm}T23:59:59`);

  await db.sorteio.create({
    data: {
      titulo: d.titulo,
      premio: d.premio,
      nivelMinimo: d.nivelMinimo,
      inicioEm: inicio,
      fimEm: fim,
    },
  });

  revalidatePath("/admin/sorteios");
  return { ok: true };
}

/**
 * Apura o sorteio.
 *
 * O número de participantes é gravado junto com o ganhador: a lista é
 * calculada na hora, e sem congelar quantos eram, uma consulta feita semanas
 * depois devolveria outro resultado e faria a apuração parecer errada.
 */
export async function apurarSorteio(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const s = await db.sorteio.findUnique({ where: { id } });
  if (!s || s.status !== "ABERTO") return;

  const lista = await elegiveis(s);
  if (lista.length === 0) return;

  const ganhador = lista[Math.floor(Math.random() * lista.length)];

  await db.sorteio.update({
    where: { id },
    data: {
      status: "SORTEADO",
      ganhadorId: ganhador.id,
      participantes: lista.length,
      sorteadoEm: new Date(),
      sorteadoPor: u.nome,
    },
  });

  revalidatePath("/admin/sorteios");
  revalidatePath("/app");
}

export async function cancelarSorteio(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const s = await db.sorteio.findUnique({ where: { id } });
  if (!s || s.status !== "ABERTO") return;

  await db.sorteio.update({ where: { id }, data: { status: "CANCELADO" } });
  revalidatePath("/admin/sorteios");
}

export async function excluirSorteio(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  await db.sorteio.deleteMany({ where: { id } });
  revalidatePath("/admin/sorteios");
}
