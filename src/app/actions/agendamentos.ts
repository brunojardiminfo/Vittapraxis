"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { concluirAgendamento } from "@/lib/sessao";

/** Garante que o agendamento pertence ao paciente logado antes de alterá-lo. */
async function agendamentoDoPaciente(agendamentoId: string) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) return null;

  const ag = await db.agendamento.findUnique({ where: { id: agendamentoId } });
  if (!ag || ag.pacienteId !== u.perfilId) return null;
  return ag;
}

export async function confirmarAgendamento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const ag = await agendamentoDoPaciente(id);
  if (!ag || ag.status !== "AGENDADO") return;

  await db.agendamento.update({
    where: { id },
    data: { status: "CONFIRMADO" },
  });
  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
}

export async function cancelarAgendamento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const ag = await agendamentoDoPaciente(id);
  if (!ag || !["AGENDADO", "CONFIRMADO"].includes(ag.status)) return;

  await db.agendamento.update({
    where: { id },
    data: { status: "CANCELADO" },
  });
  revalidatePath("/app/agendamentos");
  revalidatePath("/app");
}

/** A administração confirma que a sessão aconteceu — regras em concluirAgendamento. */
export async function concluirSessao(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  if (!(await concluirAgendamento(id))) return;

  revalidatePath("/admin/sessoes");
  revalidatePath("/admin");
  revalidatePath("/app/agendamentos");
  revalidatePath("/app/beneficios");
  revalidatePath("/app");
}

/** A clínica encerra a sessão que não aconteceu. Sem pontos, claro. */
export async function cancelarPelaClinica(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const ag = await db.agendamento.findUnique({ where: { id } });
  if (!ag || !["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"].includes(ag.status)) {
    return;
  }

  await db.agendamento.update({
    where: { id },
    data: { status: "CANCELADO" },
  });

  revalidatePath("/admin/sessoes");
  revalidatePath("/admin");
  revalidatePath("/app/agendamentos");
}

export async function fazerCheckin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const ag = await agendamentoDoPaciente(id);
  if (!ag || ag.checkinEm) return;

  await db.agendamento.update({
    where: { id },
    data: { checkinEm: new Date() },
  });
  revalidatePath("/app/agendamentos");
}
