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

/** Dinheiro opcional: vazio vira nulo, e não zero. */
const dinheiroOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/\./g, "").replace(",", ".") : null))
  .pipe(z.coerce.number().min(0).nullable());

// A duração saiu da tela a pedido da direção; o valor gravado continua
// alimentando o "adicionar à agenda" do paciente.
const ServicoSchema = z.object({
  id: z.string().min(1),
  /// Vazio significa "sem promoção"
  precoPromocional: dinheiroOpcional,
  precoAvulso: dinheiro,
  /// Vazio significa "não vendemos em pacote", não zero
  precoEmPlano: dinheiroOpcional,
  /// Vazio significa "usa o padrão global do Clube"
  pontos: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.coerce.number().int().min(0).nullable()),
  ativo: z.boolean(),
  exibirPreco: z.boolean(),
  exibirPromocional: z.boolean(),
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
    precoPromocional: formData.get("precoPromocional") ?? undefined,
    precoAvulso: formData.get("precoAvulso"),
    precoEmPlano: formData.get("precoEmPlano") ?? undefined,
    pontos: formData.get("pontos") ?? undefined,
    ativo: formData.get("ativo") === "on",
    exibirPreco: formData.get("exibirPreco") === "on",
    exibirPromocional: formData.get("exibirPromocional") === "on",
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, ...dados } = parsed.data;

  if (dados.precoEmPlano !== null && dados.precoEmPlano > dados.precoAvulso) {
    return { erro: "O preço em pacote não pode ser maior que o avulso." };
  }
  if (
    dados.precoPromocional !== null &&
    dados.precoPromocional >= dados.precoAvulso
  ) {
    return { erro: "O promocional precisa ser menor que a sessão avulsa." };
  }

  const servico = await db.servico.findUnique({ where: { id } });
  if (!servico) return { erro: "Serviço não encontrado." };

  await db.servico.update({
    where: { id },
    data: dados,
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
