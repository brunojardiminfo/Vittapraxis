"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { lancarClube, pontosDoServico, regrasDoClube } from "@/lib/clube";

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

/**
 * Confirma que a sessão aconteceu e credita os pontos.
 *
 * Quem chama é a administração, não o paciente: ponto vira dinheiro em
 * cashback e nível no Clube, então deixar o próprio beneficiário declarar que
 * fez a sessão seria pedir para o saldo ser inflado. O paciente avisa que
 * compareceu — a clínica confirma.
 *
 * Os pontos saem do serviço, com o padrão do Clube como reserva. O lançamento
 * carrega o id do agendamento, e o índice único nessa coluna é o que garante
 * que clicar duas vezes não credita duas vezes.
 */
export async function concluirSessao(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const ag = await db.agendamento.findUnique({ where: { id } });
  if (!ag) return;
  if (!["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"].includes(ag.status)) return;
  // Marcar como feita antes da hora abriria caminho para juntar pontos de
  // sessões que ainda não aconteceram
  if (ag.inicio > new Date()) return;

  const [servico, regras] = await Promise.all([
    db.servico.findUnique({ where: { id: ag.servicoId } }),
    regrasDoClube(),
  ]);
  if (!servico) return;

  const pontos = pontosDoServico(servico, regras);

  await db.$transaction(async (tx) => {
    await tx.agendamento.update({
      where: { id },
      data: { status: "CONCLUIDO" },
    });

    if (pontos > 0) {
      await lancarClube(tx, {
        pacienteId: ag.pacienteId,
        tipo: "PONTOS",
        valor: pontos,
        motivo: `Sessão de ${servico.nome}`,
        origem: "SESSAO",
        agendamentoId: id,
      });
    }

    // Bônus de entrada no Clube: vale uma vez, na primeira sessão que a
    // clínica confirma. Procuramos no extrato em vez de guardar uma flag no
    // paciente — o lançamento já é a prova de que foi pago, e uma flag
    // poderia divergir dele.
    if (regras.pontosCadastro > 0) {
      const jaGanhou = await tx.lancamentoClube.findFirst({
        where: { pacienteId: ag.pacienteId, origem: "CADASTRO" },
        select: { id: true },
      });

      if (!jaGanhou) {
        await lancarClube(tx, {
          pacienteId: ag.pacienteId,
          tipo: "PONTOS",
          valor: regras.pontosCadastro,
          motivo: "Cadastro no Clube e primeira sessão concluída",
          origem: "CADASTRO",
        });
      }
    }

    // O cashback da indicação vence aqui, e não quando a pessoa se cadastra:
    // quem indicou só ganha se o indicado de fato se tratar. Como isto roda
    // dentro da conclusão, "primeira sessão" é a única ainda pendente.
    const indicacao = await tx.indicacao.findFirst({
      where: { indicadoId: ag.pacienteId, status: "PENDENTE" },
    });

    if (indicacao && regras.cashbackPorIndicacao > 0) {
      await tx.indicacao.update({
        where: { id: indicacao.id },
        data: { status: "CONFIRMADA" },
      });

      await lancarClube(tx, {
        pacienteId: indicacao.pacienteId,
        tipo: "CASHBACK",
        valor: regras.cashbackPorIndicacao,
        motivo: `Indicação de ${indicacao.nome} — primeira sessão realizada`,
        origem: "INDICACAO",
        indicacaoId: indicacao.id,
      });

      // O crédito tem prazo: nasce como voucher com data de vencimento, para
      // que o paciente veja até quando pode usar e o saldo não fique eterno.
      const vence = new Date();
      vence.setMonth(vence.getMonth() + regras.validadeCreditoMeses);

      await tx.voucher.create({
        data: {
          pacienteId: indicacao.pacienteId,
          tipo: "INDICACAO",
          titulo: `Crédito por indicar ${indicacao.nome}`,
          descricao:
            "Use para abater o valor de sessões e serviços elegíveis.",
          valor: regras.cashbackPorIndicacao,
          validoAte: vence,
          indicacaoId: indicacao.id,
        },
      });
    }
  });

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
