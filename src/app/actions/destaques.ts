"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v !== "" ? v : null));

const DestaqueSchema = z
  .object({
    id: z.string().optional(),
    titulo: z.string().trim().min(3, "Informe o título."),
    texto: z.string().trim().min(5, "Escreva o texto do cartão."),
    etiqueta: opcional(40),
    imagem: opcional(200),
    link: opcional(300),
    linkTexto: opcional(40),
    ordem: z.coerce.number().int().min(0).default(0),
    inicioEm: opcional(30),
    fimEm: opcional(30),
  })
  .refine(
    (d) => !d.inicioEm || !d.fimEm || new Date(d.fimEm) >= new Date(d.inicioEm),
    { message: "A data final não pode ser antes da inicial.", path: ["fimEm"] }
  );

export type EstadoDestaque = { ok?: boolean; erro?: string };

function paraData(v: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Cria um cartão novo, ou atualiza um existente quando recebe o id. */
export async function salvarDestaque(
  _estado: EstadoDestaque,
  formData: FormData
): Promise<EstadoDestaque> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = DestaqueSchema.safeParse({
    id: formData.get("id") || undefined,
    titulo: formData.get("titulo"),
    texto: formData.get("texto"),
    etiqueta: formData.get("etiqueta") ?? undefined,
    imagem: formData.get("imagem") ?? undefined,
    link: formData.get("link") ?? undefined,
    linkTexto: formData.get("linkTexto") ?? undefined,
    ordem: formData.get("ordem") || 0,
    inicioEm: formData.get("inicioEm") ?? undefined,
    fimEm: formData.get("fimEm") ?? undefined,
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, ...d } = parsed.data;

  const dados = {
    titulo: d.titulo,
    texto: d.texto,
    etiqueta: d.etiqueta,
    imagem: d.imagem,
    link: d.link,
    linkTexto: d.linkTexto,
    ordem: d.ordem,
    inicioEm: paraData(d.inicioEm),
    fimEm: paraData(d.fimEm),
  };

  if (id) {
    const existe = await db.destaque.findUnique({ where: { id } });
    if (!existe) return { erro: "Cartão não encontrado." };
    // O liga-desliga tem botão próprio, então editar não mexe no ativo
    await db.destaque.update({ where: { id }, data: dados });
  } else {
    await db.destaque.create({ data: dados });
  }

  revalidatePath("/admin/destaques");
  revalidatePath("/app");
  return { ok: true };
}

/** Liga e desliga sem apagar — promoção costuma voltar. */
export async function alternarDestaque(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const atual = await db.destaque.findUnique({ where: { id } });
  if (!atual) return;

  await db.destaque.update({
    where: { id },
    data: { ativo: !atual.ativo },
  });

  revalidatePath("/admin/destaques");
  revalidatePath("/app");
}

export async function excluirDestaque(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const existe = await db.destaque.findUnique({ where: { id } });
  if (!existe) return;

  await db.destaque.delete({ where: { id } });

  revalidatePath("/admin/destaques");
  revalidatePath("/app");
}

/**
 * Os cartões que o paciente deve ver agora.
 *
 * A janela de datas é filtrada aqui, e não na tela, para que uma promoção
 * vencida nunca chegue ao portal por esquecimento de desligar.
 */
export async function destaquesAtivos() {
  const agora = new Date();
  return db.destaque.findMany({
    where: {
      ativo: true,
      AND: [
        { OR: [{ inicioEm: null }, { inicioEm: { lte: agora } }] },
        { OR: [{ fimEm: null }, { fimEm: { gte: agora } }] },
      ],
    },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
  });
}
