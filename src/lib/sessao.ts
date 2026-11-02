import { db } from "@/lib/db";
import { lancarClube, pontosDoServico, regrasDoClube, valorIndicacao } from "@/lib/clube";

/** Último instante do dia de hoje. */
function fimDeHoje() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Marca a sessão como realizada e paga o que ela gera no Clube.
 *
 * Quem chama é a clínica — a administração ou o profissional que atendeu —,
 * nunca o paciente: ponto vira dinheiro em cashback e nível no Clube, então
 * deixar o próprio beneficiário declarar que fez a sessão seria pedir para o
 * saldo ser inflado.
 *
 * Os pontos saem do serviço, com o padrão do Clube como reserva. O lançamento
 * carrega o id do agendamento, e o índice único nessa coluna é o que garante
 * que concluir duas vezes não credita duas vezes.
 *
 * Devolve false quando a sessão não pode ser concluída.
 */
export async function concluirAgendamento(id: string) {
  const ag = await db.agendamento.findUnique({ where: { id } });
  if (!ag) return false;
  if (!["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"].includes(ag.status)) {
    return false;
  }
  // Marcar como feita antes do dia abriria caminho para juntar pontos de
  // sessões que ainda não aconteceram
  if (ag.inicio > fimDeHoje()) return false;

  const [servico, regras] = await Promise.all([
    db.servico.findUnique({ where: { id: ag.servicoId } }),
    regrasDoClube(),
  ]);
  if (!servico) return false;

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

    // O crédito da indicação vence aqui, e não quando a pessoa se cadastra:
    // quem indicou só ganha se o indicado de fato se tratar. Como isto roda
    // dentro da conclusão, "primeira sessão" é a única ainda pendente — e o
    // valor é uma fatia do preço dela, como a direção definiu.
    const indicacao = await tx.indicacao.findFirst({
      where: { indicadoId: ag.pacienteId, status: "PENDENTE" },
    });
    const credito = valorIndicacao(servico.precoAvulso, regras);

    if (indicacao && credito > 0) {
      await tx.indicacao.update({
        where: { id: indicacao.id },
        data: { status: "CONFIRMADA" },
      });

      await lancarClube(tx, {
        pacienteId: indicacao.pacienteId,
        tipo: "CASHBACK",
        valor: credito,
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
          descricao: `${regras.indicacaoPercentual.toLocaleString("pt-BR")}% da primeira sessão de ${servico.nome}. Use para abater o valor de sessões e serviços elegíveis.`,
          valor: credito,
          validoAte: vence,
          indicacaoId: indicacao.id,
        },
      });
    }
  });

  return true;
}
