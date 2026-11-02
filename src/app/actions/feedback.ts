"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const FeedbackSchema = z.object({
  tipo: z.enum(["ELOGIO", "SUGESTAO", "RECLAMACAO"]),
  assunto: z.string().trim().min(3, "Resuma em poucas palavras o assunto."),
  mensagem: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais para a gente entender.")
    .max(2000),
});

export type EstadoFeedback = { ok?: boolean; erro?: string };

/**
 * Diferente do agendamento e do vale-presente, isso não vai para o WhatsApp:
 * um elogio ou uma reclamação precisa virar registro com resposta escrita, e
 * conversa de WhatsApp se perde. Fica aqui, com histórico visível dos dois
 * lados.
 */
export async function enviarFeedback(
  _estado: EstadoFeedback,
  formData: FormData
): Promise<EstadoFeedback> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) {
    return { erro: "Sessão expirada. Entre novamente." };
  }

  const parsed = FeedbackSchema.safeParse({
    tipo: formData.get("tipo"),
    assunto: formData.get("assunto"),
    mensagem: formData.get("mensagem"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  await db.feedback.create({
    data: { pacienteId: u.perfilId, ...parsed.data },
  });

  revalidatePath("/app/feedback");
  revalidatePath("/admin/feedback");
  return { ok: true };
}

const RespostaSchema = z.object({
  id: z.string().min(1),
  resposta: z.string().trim().min(2, "Escreva a resposta.").max(2000),
});

export type EstadoResposta = { ok?: boolean; erro?: string };

/** A administração responde por escrito; a resposta aparece para o paciente. */
export async function responderFeedback(
  _estado: EstadoResposta,
  formData: FormData
): Promise<EstadoResposta> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = RespostaSchema.safeParse({
    id: formData.get("id"),
    resposta: formData.get("resposta"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  const { id, resposta } = parsed.data;
  const feedback = await db.feedback.findUnique({ where: { id } });
  if (!feedback) return { erro: "Mensagem não encontrada." };

  await db.feedback.update({
    where: { id },
    data: { resposta, status: "RESOLVIDO" },
  });

  revalidatePath("/admin/feedback");
  revalidatePath("/app/feedback");
  return { ok: true };
}

/**
 * Tira da fila de "abertos" sem responder — serve para o que foi lido e não
 * pede resposta, como um elogio.
 */
export async function marcarFeedbackLido(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const feedback = await db.feedback.findUnique({ where: { id } });
  if (!feedback || feedback.status !== "ABERTO") return;

  await db.feedback.update({ where: { id }, data: { status: "LIDO" } });
  revalidatePath("/admin/feedback");
  revalidatePath("/app/feedback");
}
