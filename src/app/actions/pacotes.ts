"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const PacoteSchema = z.object({
  servicoId: z.string().min(1, "Escolha o serviço."),
  sessoesContratadas: z.coerce
    .number()
    .int()
    .min(2, "Um pacote tem ao menos 2 sessões.")
    .max(60, "Confira o número de sessões."),
  sessoesUtilizadas: z.coerce.number().int().min(0).default(0),
  validade: z.string().min(1, "Informe até quando o pacote vale."),
});

export type EstadoPacote = { ok?: boolean; erro?: string };

/**
 * O paciente registra o pacote que comprou na clínica, para acompanhar
 * quantas sessões ainda tem.
 *
 * Quem vende e cobra é a recepção, pelo Clínica Ágil — isto aqui é o
 * contador do próprio paciente, do mesmo jeito que ele registra a sessão já
 * marcada no WhatsApp. Se o número divergir, vale o que a clínica tem.
 */
export async function registrarPacote(
  _estado: EstadoPacote,
  formData: FormData
): Promise<EstadoPacote> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) {
    return { erro: "Sessão expirada. Entre novamente." };
  }

  const parsed = PacoteSchema.safeParse({
    servicoId: formData.get("servicoId"),
    sessoesContratadas: formData.get("sessoesContratadas"),
    sessoesUtilizadas: formData.get("sessoesUtilizadas") || 0,
    validade: formData.get("validade"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { servicoId, sessoesContratadas, sessoesUtilizadas, validade } =
    parsed.data;

  if (sessoesUtilizadas > sessoesContratadas) {
    return { erro: "As sessões usadas não podem passar das contratadas." };
  }

  const servico = await db.servico.findUnique({ where: { id: servicoId } });
  if (!servico) return { erro: "Serviço não encontrado." };

  const vence = new Date(validade);
  if (Number.isNaN(vence.getTime())) return { erro: "Data de validade inválida." };
  if (vence < new Date()) return { erro: "Essa validade já passou." };

  const jaTem = await db.pacote.findFirst({
    where: { pacienteId: u.perfilId, servicoId, status: "ATIVO" },
    select: { id: true },
  });
  if (jaTem) {
    return { erro: "Você já tem um pacote ativo desse serviço." };
  }

  await db.pacote.create({
    data: {
      pacienteId: u.perfilId,
      servicoId,
      sessoesContratadas,
      sessoesUtilizadas,
      validade: vence,
      status: "ATIVO",
    },
  });

  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
  return { ok: true };
}

/** Marca mais uma sessão usada do pacote, fechando quando chega ao fim. */
export async function usarSessaoPacote(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) return;

  const id = String(formData.get("id") ?? "");
  const pacote = await db.pacote.findUnique({ where: { id } });
  if (!pacote || pacote.pacienteId !== u.perfilId) return;
  if (pacote.status !== "ATIVO") return;
  if (pacote.sessoesUtilizadas >= pacote.sessoesContratadas) return;

  const usadas = pacote.sessoesUtilizadas + 1;

  await db.pacote.update({
    where: { id },
    data: {
      sessoesUtilizadas: usadas,
      // Chegou ao fim: sai da lista de ativos sem sumir do histórico
      status: usadas >= pacote.sessoesContratadas ? "CONCLUIDO" : "ATIVO",
    },
  });

  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
}

export async function excluirPacote(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) return;

  const id = String(formData.get("id") ?? "");
  const pacote = await db.pacote.findUnique({ where: { id } });
  if (!pacote || pacote.pacienteId !== u.perfilId) return;

  await db.pacote.delete({ where: { id } });

  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
}
