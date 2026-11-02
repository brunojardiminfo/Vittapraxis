"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const MensagemSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().trim().min(3, "Dê um título à mensagem."),
  para: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v : null)),
  texto: z.string().trim().min(5, "Escreva o texto da mensagem.").max(4000),
});

export type EstadoMensagem = { ok?: boolean; erro?: string };

/** Cria ou edita uma mensagem pronta. */
export async function salvarMensagem(
  _estado: EstadoMensagem,
  formData: FormData
): Promise<EstadoMensagem> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = MensagemSchema.safeParse({
    id: formData.get("id") || undefined,
    titulo: formData.get("titulo"),
    para: formData.get("para") || undefined,
    texto: formData.get("texto"),
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, ...dados } = parsed.data;

  if (id) {
    const existe = await db.mensagemPronta.findUnique({ where: { id } });
    if (!existe) return { erro: "Mensagem não encontrada." };
    await db.mensagemPronta.update({ where: { id }, data: dados });
  } else {
    // Nova entra no fim da lista
    const ultima = await db.mensagemPronta.findFirst({
      orderBy: { ordem: "desc" },
      select: { ordem: true },
    });
    await db.mensagemPronta.create({
      data: { ...dados, ordem: (ultima?.ordem ?? -1) + 1 },
    });
  }

  revalidatePath("/admin/mensagens");
  return { ok: true };
}

export async function excluirMensagem(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  await db.mensagemPronta.deleteMany({ where: { id } });
  revalidatePath("/admin/mensagens");
}
