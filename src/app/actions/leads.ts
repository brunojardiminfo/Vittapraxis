"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const LeadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  telefone: z
    .string()
    .trim()
    // Aceita com ou sem máscara; só exige dígitos suficientes para um celular
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  interesse: z.string().trim().max(80).optional(),
  mensagem: z.string().trim().max(600).optional(),
  indicadoPor: z.string().trim().max(40).optional(),
  periodo: z.enum(["MANHA", "TARDE", "QUALQUER"]).optional(),
  diasPreferidos: z.array(z.string()).optional(),
});

const ROTULO_PERIODO: Record<string, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  QUALQUER: "Tanto faz",
};

const ROTULO_DIA: Record<string, string> = {
  SEG: "Seg",
  TER: "Ter",
  QUA: "Qua",
  QUI: "Qui",
  SEX: "Sex",
  SAB: "Sáb",
};

export type EstadoLead = { ok?: boolean; erro?: string };

export async function cadastrarLead(
  _estado: EstadoLead,
  formData: FormData
): Promise<EstadoLead> {
  const parsed = LeadSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    interesse: formData.get("interesse") || undefined,
    mensagem: formData.get("mensagem") || undefined,
    indicadoPor: formData.get("indicadoPor") || undefined,
    periodo: formData.get("periodo") || undefined,
    diasPreferidos: formData.getAll("dias").map(String),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  const { email, periodo, diasPreferidos, ...dadosLead } = parsed.data;

  // Preferência de horário não tem coluna própria em Lead: cabe na mensagem,
  // que é o que a recepção lê antes de ligar. Uma coluna a mais só para isso
  // seria peso sem uso.
  const preferencia = [
    periodo ? `Prefere: ${ROTULO_PERIODO[periodo]}` : null,
    diasPreferidos?.length
      ? `Dias: ${diasPreferidos.map((d) => ROTULO_DIA[d] ?? d).join(", ")}`
      : null,
  ].filter(Boolean);

  const mensagemFinal = [dadosLead.mensagem, preferencia.join(" · ")]
    .filter((p) => p && p !== "")
    .join("\n")
    .slice(0, 600);

  // Reenvio do mesmo e-mail em pouco tempo é quase sempre duplo clique ou
  // impaciência; responder "ok" evita poluir a fila da recepção.
  const recente = await db.lead.findFirst({
    where: {
      email: email.toLowerCase(),
      criadoEm: { gte: new Date(Date.now() - 1000 * 60 * 30) },
    },
    select: { id: true },
  });
  if (recente) return { ok: true };

  const lead = await db.lead.create({
    data: {
      ...dadosLead,
      email: email.toLowerCase(),
      mensagem: mensagemFinal || null,
      status: "NOVO",
    },
  });

  // Chegou com código de convite: registra a indicação como PENDENTE para
  // quem indicou já enxergar o movimento. O cashback não sai daqui — ele só
  // é devido quando a pessoa indicada realmente fizer uma sessão.
  if (parsed.data.indicadoPor) {
    const padrinho = await db.paciente.findUnique({
      where: { codigoIndicacao: parsed.data.indicadoPor.trim().toUpperCase() },
      select: { id: true },
    });

    if (padrinho) {
      await db.indicacao.create({
        data: {
          pacienteId: padrinho.id,
          nome: dadosLead.nome,
          status: "PENDENTE",
          leadId: lead.id,
        },
      });
      revalidatePath("/app/beneficios");
    }
  }

  revalidatePath("/admin");
  return { ok: true };
}

/** A administração marca que já falou com a pessoa, tirando-a da fila de novos. */
export async function marcarLeadContatado(formData: FormData) {
  const { usuarioAtual } = await import("@/lib/auth");
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead || lead.status !== "NOVO") return;

  await db.lead.update({ where: { id }, data: { status: "EM_CONTATO" } });
  revalidatePath("/admin");
}
