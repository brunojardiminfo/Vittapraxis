"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const ProfissionalSchema = z.object({
  id: z.string().optional(),
  nome: z.string().trim().min(3, "Informe o nome completo."),
  especialidade: z.string().trim().min(3, "Informe a especialidade."),
  bio: z.string().trim().min(10, "Escreva uma apresentação curta."),
  credencial: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  foto: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  ordem: z.coerce.number().int().min(0).max(999).default(0),
  ativo: z.boolean(),
  /// Quais serviços essa pessoa atende
  servicos: z.array(z.string()).default([]),
});

export type EstadoProfissional = { ok?: boolean; erro?: string };

/** Duas primeiras letras do nome, para o avatar quando não há foto. */
function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const letras = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return letras.toUpperCase() || "VP";
}

function revalidarEquipe() {
  revalidatePath("/admin/equipe");
  revalidatePath("/");
  revalidatePath("/especialidades");
  revalidatePath("/app/equipe");
  revalidatePath("/app/agendamentos/solicitar");
  revalidatePath("/app/agendamentos/registrar");
}

/**
 * Cria ou atualiza um profissional.
 *
 * Os serviços que ele atende são gravados junto: é essa ligação que faz o
 * paciente ver a lista certa de profissionais ao escolher um serviço, em vez
 * de uma lista com a clínica inteira.
 */
export async function salvarProfissional(
  _estado: EstadoProfissional,
  formData: FormData
): Promise<EstadoProfissional> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = ProfissionalSchema.safeParse({
    id: formData.get("id") || undefined,
    nome: formData.get("nome"),
    especialidade: formData.get("especialidade"),
    bio: formData.get("bio"),
    credencial: formData.get("credencial") ?? undefined,
    foto: formData.get("foto") ?? undefined,
    ordem: formData.get("ordem") || 0,
    ativo: formData.get("ativo") === "on",
    servicos: formData.getAll("servicos").map(String),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, servicos, ...d } = parsed.data;

  const campos = { ...d, iniciais: iniciaisDe(d.nome) };
  const ligacoes = servicos.map((s) => ({ id: s }));

  if (id) {
    const existe = await db.profissional.findUnique({ where: { id } });
    if (!existe) return { erro: "Profissional não encontrado." };

    await db.profissional.update({
      where: { id },
      // `set` troca a lista inteira; com `connect`, desmarcar um serviço não
      // o removeria, só deixaria de adicioná-lo de novo
      data: { ...campos, servicos: { set: ligacoes } },
    });
  } else {
    await db.profissional.create({
      data: { ...campos, servicos: { connect: ligacoes } },
    });
  }

  revalidarEquipe();
  return { ok: true };
}

/**
 * Tira do ar sem apagar.
 *
 * O histórico de sessões aponta para o profissional, então excluir levaria
 * junto o registro de quem atendeu — e a agenda passada deixaria de fazer
 * sentido.
 */
export async function alternarProfissional(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const atual = await db.profissional.findUnique({ where: { id } });
  if (!atual) return;

  await db.profissional.update({
    where: { id },
    data: { ativo: !atual.ativo },
  });

  revalidarEquipe();
}
