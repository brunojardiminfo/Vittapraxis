"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

const SessaoSchema = z.object({
  servicoId: z.string().min(1, "Escolha o serviço."),
  profissionalId: z.string().min(1, "Escolha o profissional."),
  data: z.string().min(1, "Informe a data."),
  hora: z.string().min(1, "Informe o horário."),
});

export type EstadoSessao = { ok?: boolean; erro?: string };

/**
 * O agendamento oficial acontece no Clínica Ágil, pelo WhatsApp. Aqui o
 * paciente registra o que já foi confirmado, para ter a própria agenda,
 * responder o Índice de Bem-Estar antes da sessão e somar pontos no Clube.
 */
export async function registrarSessao(
  _estado: EstadoSessao,
  formData: FormData
): Promise<EstadoSessao> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) {
    return { erro: "Sessão expirada. Entre novamente." };
  }

  const parsed = SessaoSchema.safeParse({
    servicoId: formData.get("servicoId"),
    profissionalId: formData.get("profissionalId"),
    data: formData.get("data"),
    hora: formData.get("hora"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { servicoId, profissionalId, data, hora } = parsed.data;

  const servico = await db.servico.findUnique({ where: { id: servicoId } });
  if (!servico) return { erro: "Serviço não encontrado." };

  const atende = await db.profissional.findFirst({
    where: { id: profissionalId, servicos: { some: { id: servicoId } } },
    select: { id: true },
  });
  if (!atende) {
    return { erro: "Esse profissional não atende o serviço escolhido." };
  }

  // datetime-local não carrega fuso; montar assim mantém o horário da clínica
  const inicio = new Date(`${data}T${hora}:00`);
  if (Number.isNaN(inicio.getTime())) return { erro: "Data ou horário inválido." };

  // O paciente registra o que já foi confirmado — o passado não faz sentido
  if (inicio < new Date()) {
    return { erro: "Essa data já passou. Registre sessões futuras." };
  }

  const jaTem = await db.agendamento.findFirst({
    where: {
      pacienteId: u.perfilId,
      inicio,
      status: { not: "CANCELADO" },
    },
    select: { id: true },
  });
  if (jaTem) return { erro: "Você já registrou uma sessão nesse horário." };

  await db.agendamento.create({
    data: {
      pacienteId: u.perfilId,
      profissionalId,
      servicoId,
      inicio,
      duracaoMin: servico.duracaoMin,
      // Já veio confirmada da conversa no WhatsApp
      status: "CONFIRMADO",
    },
  });

  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
  return { ok: true };
}

export async function excluirSessao(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) return;

  const id = String(formData.get("id") ?? "");
  const ag = await db.agendamento.findUnique({ where: { id } });
  if (!ag || ag.pacienteId !== u.perfilId) return;

  await db.agendamento.delete({ where: { id } });

  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
}
