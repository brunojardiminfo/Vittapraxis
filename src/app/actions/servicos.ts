"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

/** Campo de dinheiro digitado por gente: aceita "280", "280,50" e "1.280,50". */
const dinheiro = z
  .string()
  .trim()
  .transform((v) => v.replace(/\./g, "").replace(",", "."))
  .pipe(z.coerce.number().min(0, "Valor não pode ser negativo."));

const ServicoSchema = z.object({
  id: z.string().min(1),
  duracaoMin: z.coerce
    .number()
    .int()
    .min(5, "Duração mínima de 5 minutos.")
    .max(480, "Duração máxima de 8 horas."),
  precoAvulso: dinheiro,
  /// Vazio significa "não vendemos em pacote", não zero
  precoEmPlano: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/\./g, "").replace(",", ".") : null))
    .pipe(z.coerce.number().min(0).nullable()),
  /// Vazio significa "usa o padrão global do Clube"
  pontos: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.coerce.number().int().min(0).nullable()),
  ativo: z.boolean(),
});

export type EstadoServico = { ok?: boolean; erro?: string };

/**
 * O serviço é lido pelo site, pela página de especialidades e pelo portal —
 * todos da mesma linha do banco. Por isso um salvamento aqui revalida as três
 * frentes: sem isso o site continuaria servindo o cache com o valor antigo.
 */
export async function salvarServico(
  _estado: EstadoServico,
  formData: FormData
): Promise<EstadoServico> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = ServicoSchema.safeParse({
    id: formData.get("id"),
    duracaoMin: formData.get("duracaoMin"),
    precoAvulso: formData.get("precoAvulso"),
    precoEmPlano: formData.get("precoEmPlano") ?? undefined,
    pontos: formData.get("pontos") ?? undefined,
    ativo: formData.get("ativo") === "on",
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, duracaoMin, precoAvulso, precoEmPlano, pontos, ativo } =
    parsed.data;

  if (precoEmPlano !== null && precoEmPlano > precoAvulso) {
    return { erro: "O preço em pacote não pode ser maior que o avulso." };
  }

  const servico = await db.servico.findUnique({ where: { id } });
  if (!servico) return { erro: "Serviço não encontrado." };

  await db.servico.update({
    where: { id },
    data: { duracaoMin, precoAvulso, precoEmPlano, pontos, ativo },
  });

  // Site público
  revalidatePath("/");
  revalidatePath("/especialidades");
  revalidatePath("/vale-presente");
  // Portal do paciente
  revalidatePath("/app/servicos");
  revalidatePath("/app/agendamentos/solicitar");
  // Painel
  revalidatePath("/admin/servicos");

  return { ok: true };
}
