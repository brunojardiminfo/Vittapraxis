"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { REGIOES } from "@/lib/mapa-corporal";

const idsValidos = new Set(REGIOES.map((r) => r.id));

const RespostaSchema = z.object({
  humor: z.coerce.number().int().min(1).max(5),
  sono: z.coerce.number().int().min(1).max(5),
  hidratacao: z.coerce.number().int().min(1).max(5),
  dor: z.coerce.number().int().min(0).max(10),
  exercitou: z.boolean(),
  observacao: z.string().max(500).optional(),
  /// Ids do mapa corporal; o que não for região conhecida é descartado
  regioesDor: z
    .string()
    .optional()
    .transform((v) => {
      const ids = (v ?? "").split("|").filter((id) => idsValidos.has(id));
      return ids.length ? ids.join("|") : null;
    }),
});

export type EstadoBemEstar = { ok?: boolean; erro?: string };

export async function registrarBemEstar(
  _estado: EstadoBemEstar,
  formData: FormData
): Promise<EstadoBemEstar> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) {
    return { erro: "Sessão expirada. Entre novamente." };
  }

  const parsed = RespostaSchema.safeParse({
    humor: formData.get("humor"),
    sono: formData.get("sono"),
    hidratacao: formData.get("hidratacao"),
    dor: formData.get("dor"),
    // O wizard manda todas as respostas como número; aqui 1 é sim
    exercitou: formData.get("exercitou") === "1",
    observacao: formData.get("observacao") || undefined,
    regioesDor: formData.get("regioesDor") ?? undefined,
  });

  if (!parsed.success) {
    return { erro: "Responda todas as perguntas antes de enviar." };
  }

  // Vincula à próxima sessão futura, para o profissional ver a resposta
  // já associada ao atendimento certo.
  const proximo = await db.agendamento.findFirst({
    where: {
      pacienteId: u.perfilId,
      inicio: { gte: new Date() },
      status: { in: ["AGENDADO", "CONFIRMADO"] },
      indice: null,
    },
    orderBy: { inicio: "asc" },
    select: { id: true },
  });

  await db.indiceBemEstar.create({
    data: {
      pacienteId: u.perfilId,
      agendamentoId: proximo?.id ?? null,
      ...parsed.data,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/bem-estar");
  revalidatePath("/app/evolucao");
  return { ok: true };
}
