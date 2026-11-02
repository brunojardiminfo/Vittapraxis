"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const ConfigSchema = z.object({
  pontosCadastro: z.coerce.number().int().min(0).max(100000),
  pontosPorSessao: z.coerce
    .number()
    .int("Use um número inteiro de pontos.")
    .min(0)
    .max(100000),
  pontosPorPacote: z.coerce.number().int().min(0).max(100000),
  cashbackPorIndicacao: z.coerce.number().min(0).max(10000),
  validadeCreditoMeses: z.coerce
    .number()
    .int()
    .min(1, "O crédito precisa valer ao menos um mês.")
    .max(120),
  vouchersAniversarioAno: z.coerce.number().int().min(0).max(12),
});

export type EstadoConfig = { ok?: boolean; erro?: string };

/** Revalida as três frentes que leem as regras do Clube ao mesmo tempo. */
function revalidarClube() {
  revalidatePath("/clube");
  revalidatePath("/app/beneficios");
  revalidatePath("/app");
  revalidatePath("/admin/configuracoes");
}

export async function salvarConfiguracao(
  _estado: EstadoConfig,
  formData: FormData
): Promise<EstadoConfig> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") {
    return { erro: "Apenas a administração pode alterar as regras." };
  }

  const parsed = ConfigSchema.safeParse({
    pontosCadastro: formData.get("pontosCadastro"),
    pontosPorSessao: formData.get("pontosPorSessao"),
    pontosPorPacote: formData.get("pontosPorPacote"),
    cashbackPorIndicacao: formData.get("cashbackPorIndicacao"),
    validadeCreditoMeses: formData.get("validadeCreditoMeses"),
    vouchersAniversarioAno: formData.get("vouchersAniversarioAno"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  await db.configuracao.upsert({
    where: { id: "unica" },
    create: { id: "unica", ...parsed.data },
    update: parsed.data,
  });

  revalidarClube();
  return { ok: true };
}

const NivelSchema = z.object({
  id: z.string().optional(),
  nome: z.string().trim().min(2, "Informe o nome da faixa."),
  minimo: z.coerce.number().int().min(0).max(1000000),
  beneficio: z.string().trim().min(5, "Descreva o que a faixa dá."),
});

export type EstadoNivel = { ok?: boolean; erro?: string };

/**
 * Cria ou atualiza uma faixa do Clube.
 *
 * O degrau é "a partir de", então duas faixas com o mesmo mínimo deixariam o
 * sistema sem critério para escolher entre elas — por isso a checagem de
 * colisão antes de gravar.
 */
export async function salvarNivel(
  _estado: EstadoNivel,
  formData: FormData
): Promise<EstadoNivel> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = NivelSchema.safeParse({
    id: formData.get("id") || undefined,
    nome: formData.get("nome"),
    minimo: formData.get("minimo"),
    beneficio: formData.get("beneficio"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, nome, minimo, beneficio } = parsed.data;

  const colide = await db.nivelClube.findFirst({
    where: { minimo, ...(id ? { NOT: { id } } : {}) },
    select: { nome: true },
  });
  if (colide) {
    return { erro: `A faixa "${colide.nome}" já começa em ${minimo} pontos.` };
  }

  const mesmoNome = await db.nivelClube.findFirst({
    where: { nome, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (mesmoNome) return { erro: "Já existe uma faixa com esse nome." };

  if (id) {
    await db.nivelClube.update({
      where: { id },
      data: { nome, minimo, beneficio, ordem: minimo },
    });
  } else {
    await db.nivelClube.create({
      data: { nome, minimo, beneficio, ordem: minimo },
    });
  }

  revalidarClube();
  return { ok: true };
}

/** Remove uma faixa, desde que sobre alguma para acolher quem entra. */
export async function excluirNivel(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const total = await db.nivelClube.count();
  if (total <= 1) return;

  const alvo = await db.nivelClube.findUnique({ where: { id } });
  if (!alvo) return;

  // Apagar a faixa de entrada deixaria quem tem zero ponto sem lugar
  const menor = await db.nivelClube.findFirst({ orderBy: { minimo: "asc" } });
  if (menor?.id === id) return;

  await db.nivelClube.delete({ where: { id } });
  revalidarClube();
}
