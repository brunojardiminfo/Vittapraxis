"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { concluirAgendamento } from "@/lib/sessao";
import { REGIOES } from "@/lib/mapa-corporal";

/** O profissional logado, ou null. */
async function profissionalDaSessao() {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PROFISSIONAL" || !u.profissionalId) return null;
  return { ...u, profissionalId: u.profissionalId };
}

const textoOpcional = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .transform((v) => (v ? v : null));

const FichaSchema = z.object({
  pacienteId: z.string().min(1),
  fichaClinica: z.string().trim().max(6000),
});

export type EstadoFicha = { ok?: boolean; erro?: string };

/**
 * Ficha clínica do paciente: queixa principal, objetivo e cuidados.
 *
 * É o texto que quem vai atender lê antes de chamar a pessoa. Qualquer
 * profissional da equipe edita — o paciente passa por mais de uma
 * especialidade, e a ficha é uma só.
 */
export async function salvarFicha(
  _estado: EstadoFicha,
  formData: FormData
): Promise<EstadoFicha> {
  const u = await usuarioAtual();
  if (!u || (u.papel !== "PROFISSIONAL" && u.papel !== "ADMIN")) {
    return { erro: "Sem permissão." };
  }

  const parsed = FichaSchema.safeParse({
    pacienteId: formData.get("pacienteId"),
    fichaClinica: formData.get("fichaClinica") ?? "",
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  await db.paciente.update({
    where: { id: parsed.data.pacienteId },
    data: { fichaClinica: parsed.data.fichaClinica || null },
  });

  revalidatePath(`/pro/pacientes/${parsed.data.pacienteId}`);
  revalidatePath(`/admin/pacientes/${parsed.data.pacienteId}`);
  return { ok: true };
}

const idsValidos = new Set(REGIOES.map((r) => r.id));

const AtendimentoSchema = z
  .object({
    pacienteId: z.string().min(1),
    /// Sessão já registrada; vazio cria uma agora
    agendamentoId: z.string().optional(),
    servicoId: z.string().optional(),
    queixa: textoOpcional,
    conduta: z.string().trim().min(3, "Descreva o que foi feito na sessão.").max(4000),
    evolucao: z.string().trim().min(3, "Descreva a evolução do paciente.").max(4000),
    orientacoes: textoOpcional,
    dor: z
      .string()
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : Number(v)))
      .pipe(z.number().int().min(0).max(10).nullable()),
    regioesDor: z
      .string()
      .optional()
      .transform((v) =>
        (v ?? "")
          .split("|")
          .filter((id) => idsValidos.has(id))
          .join("|")
      ),
  })
  .refine((d) => d.agendamentoId || d.servicoId, {
    message: "Escolha o serviço realizado.",
  });

export type EstadoAtendimento = { erro?: string };

/**
 * Registra o atendimento: a evolução e, junto, a sessão como realizada.
 *
 * Se o paciente já tinha registrado a sessão, a evolução se prende a ela. Se
 * não, a sessão nasce aqui, com este profissional e agora — é o que faz o
 * atendimento cair no histórico dos dois. Concluir a sessão credita os pontos
 * do Clube pelas mesmas regras de quando a administração confirma.
 */
export async function registrarAtendimento(
  _estado: EstadoAtendimento,
  formData: FormData
): Promise<EstadoAtendimento> {
  const pro = await profissionalDaSessao();
  if (!pro) return { erro: "Sessão expirada. Entre novamente." };

  const parsed = AtendimentoSchema.safeParse({
    pacienteId: formData.get("pacienteId"),
    agendamentoId: formData.get("agendamentoId") || undefined,
    servicoId: formData.get("servicoId") || undefined,
    queixa: formData.get("queixa") || undefined,
    conduta: formData.get("conduta"),
    evolucao: formData.get("evolucao"),
    orientacoes: formData.get("orientacoes") || undefined,
    dor: formData.get("dor") ?? undefined,
    regioesDor: formData.get("regioesDor") ?? undefined,
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const d = parsed.data;

  const paciente = await db.paciente.findUnique({
    where: { id: d.pacienteId },
    select: { id: true },
  });
  if (!paciente) return { erro: "Paciente não encontrado." };

  let agendamentoId: string;

  if (d.agendamentoId) {
    const ag = await db.agendamento.findUnique({
      where: { id: d.agendamentoId },
      include: { evolucao: { select: { id: true } } },
    });
    if (!ag || ag.pacienteId !== d.pacienteId) {
      return { erro: "Sessão não encontrada para este paciente." };
    }
    if (ag.profissionalId !== pro.profissionalId) {
      return { erro: "Essa sessão está com outro profissional." };
    }
    if (ag.status === "CANCELADO") return { erro: "Essa sessão foi cancelada." };
    if (ag.evolucao) return { erro: "Essa sessão já tem evolução registrada." };
    const fimDeHoje = new Date();
    fimDeHoje.setHours(23, 59, 59, 999);
    if (ag.inicio > fimDeHoje) {
      return { erro: "Essa sessão ainda não aconteceu." };
    }
    agendamentoId = ag.id;
  } else {
    const servico = await db.servico.findUnique({ where: { id: d.servicoId! } });
    if (!servico) return { erro: "Serviço não encontrado." };

    const novo = await db.agendamento.create({
      data: {
        pacienteId: d.pacienteId,
        profissionalId: pro.profissionalId,
        servicoId: servico.id,
        inicio: new Date(),
        duracaoMin: servico.duracaoMin,
        status: "EM_ATENDIMENTO",
      },
    });
    agendamentoId = novo.id;
  }

  await db.evolucao.create({
    data: {
      agendamentoId,
      pacienteId: d.pacienteId,
      profissionalId: pro.profissionalId,
      queixa: d.queixa,
      conduta: d.conduta,
      evolucao: d.evolucao,
      orientacoes: d.orientacoes,
      dor: d.dor,
      regioesDor: d.regioesDor || null,
    },
  });

  // Já concluída (a administração confirmou antes) não credita de novo:
  // concluirAgendamento recusa quem não está em aberto
  await concluirAgendamento(agendamentoId);

  revalidatePath("/pro");
  revalidatePath(`/pro/pacientes/${d.pacienteId}`);
  revalidatePath(`/admin/pacientes/${d.pacienteId}`);
  revalidatePath("/admin/sessoes");
  revalidatePath("/app");

  redirect(`/pro/pacientes/${d.pacienteId}?registrado=1`);
}

const EdicaoSchema = z.object({
  id: z.string().min(1),
  queixa: textoOpcional,
  conduta: z.string().trim().min(3, "Descreva o que foi feito na sessão.").max(4000),
  evolucao: z.string().trim().min(3, "Descreva a evolução do paciente.").max(4000),
  orientacoes: textoOpcional,
});

export type EstadoEdicaoEvolucao = { ok?: boolean; erro?: string };

/** Corrige o texto de uma evolução — só quem a escreveu. */
export async function editarEvolucao(
  _estado: EstadoEdicaoEvolucao,
  formData: FormData
): Promise<EstadoEdicaoEvolucao> {
  const pro = await profissionalDaSessao();
  if (!pro) return { erro: "Sessão expirada. Entre novamente." };

  const parsed = EdicaoSchema.safeParse({
    id: formData.get("id"),
    queixa: formData.get("queixa") || undefined,
    conduta: formData.get("conduta"),
    evolucao: formData.get("evolucao"),
    orientacoes: formData.get("orientacoes") || undefined,
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, ...dados } = parsed.data;
  const ev = await db.evolucao.findUnique({ where: { id } });
  if (!ev || ev.profissionalId !== pro.profissionalId) {
    return { erro: "Você só pode editar as evoluções que registrou." };
  }

  await db.evolucao.update({ where: { id }, data: dados });

  revalidatePath(`/pro/pacientes/${ev.pacienteId}`);
  revalidatePath(`/admin/pacientes/${ev.pacienteId}`);
  return { ok: true };
}
