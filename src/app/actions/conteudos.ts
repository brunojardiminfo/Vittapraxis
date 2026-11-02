"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { TIPOS_CONTEUDO } from "@/lib/conteudo";

const ConteudoSchema = z
  .object({
    id: z.string().optional(),
    titulo: z.string().trim().min(3, "Informe o título."),
    resumo: z.string().trim().min(10, "Escreva um resumo de uma linha."),
    corpo: z.string().trim().min(20, "O conteúdo está curto demais."),
    tipo: z.enum(TIPOS_CONTEUDO),
    categoria: z.string().trim().min(2, "Informe a categoria."),
    url: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v !== "" ? v : null)),
  })
  // Vídeo sem link vira um cartão que não leva a lugar nenhum
  .refine((d) => (d.tipo === "VIDEO" ? !!d.url : true), {
    message: "Vídeo precisa do link.",
    path: ["url"],
  })
  .refine((d) => !d.url || /^https?:\/\//i.test(d.url), {
    message: "O link precisa começar com http:// ou https://",
    path: ["url"],
  });

export type EstadoConteudo = { ok?: boolean; erro?: string };

function revalidarBiblioteca() {
  revalidatePath("/admin/biblioteca");
  revalidatePath("/app/biblioteca");
  revalidatePath("/app");
}

/** Publica um item novo ou atualiza um existente. */
export async function salvarConteudo(
  _estado: EstadoConteudo,
  formData: FormData
): Promise<EstadoConteudo> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = ConteudoSchema.safeParse({
    id: formData.get("id") || undefined,
    titulo: formData.get("titulo"),
    resumo: formData.get("resumo"),
    corpo: formData.get("corpo"),
    tipo: formData.get("tipo"),
    categoria: formData.get("categoria"),
    url: formData.get("url") ?? undefined,
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, ...dados } = parsed.data;

  // Só vídeo guarda link; trocar o tipo depois deixaria um link órfão
  const limpos = { ...dados, url: dados.tipo === "VIDEO" ? dados.url : null };

  if (id) {
    const existe = await db.conteudo.findUnique({ where: { id } });
    if (!existe) return { erro: "Conteúdo não encontrado." };
    await db.conteudo.update({ where: { id }, data: limpos });
  } else {
    await db.conteudo.create({ data: limpos });
  }

  revalidarBiblioteca();
  return { ok: true };
}

/**
 * Tira um item do ar de vez.
 *
 * Conteúdo não tem histórico preso a ele como um agendamento tem, então
 * apagar é mais simples que carregar uma coluna de arquivado que ninguém
 * consultaria.
 */
export async function excluirConteudo(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const existe = await db.conteudo.findUnique({ where: { id } });
  if (!existe) return;

  await db.conteudo.delete({ where: { id } });
  revalidarBiblioteca();
}
