import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CLINICA } from "@/lib/clinica";

/**
 * Regras do Clube Vitapraxis.
 *
 * Os números vivem no banco para a administração ajustar sem depender de
 * deploy. A página pública promete e a do paciente aplica os mesmos valores,
 * lidos daqui — se cada uma tivesse sua cópia, uma hora divergiriam e o
 * paciente veria uma promessa diferente da que o sistema cumpre.
 *
 * As faixas também são linhas de tabela, e não colunas fixas: a direção já
 * reorganizou a grade uma vez, e nada garante que seja a última.
 */

export type NivelRegra = { nome: string; minimo: number; beneficio: string };

export type RegrasClube = {
  pontosCadastro: number;
  pontosPorSessao: number;
  pontosPorPacote: number;
  cashbackPorIndicacao: number;
  validadeCreditoMeses: number;
  vouchersAniversarioAno: number;
  niveis: NivelRegra[];
};

/** Vale enquanto o banco ainda não tem configuração — primeira execução. */
const PADRAO: RegrasClube = {
  pontosCadastro: 500,
  pontosPorSessao: 100,
  pontosPorPacote: 500,
  cashbackPorIndicacao: 50,
  validadeCreditoMeses: 12,
  vouchersAniversarioAno: 1,
  niveis: [
    {
      nome: "Prata",
      minimo: 0,
      beneficio:
        "Acesso ao Clube, campanhas promocionais mensais e voucher de indicação",
    },
    {
      nome: "Platina",
      minimo: 1000,
      beneficio: "Tudo do Prata mais participação nos sorteios mensais",
    },
    {
      nome: "Ouro",
      minimo: 2000,
      beneficio: "Tudo do Platina mais o voucher especial de aniversário",
    },
  ],
};

export async function regrasDoClube(): Promise<RegrasClube> {
  const [cfg, niveis] = await Promise.all([
    db.configuracao.findUnique({ where: { id: "unica" } }),
    db.nivelClube.findMany({ orderBy: { minimo: "asc" } }),
  ]);

  if (!cfg) return PADRAO;

  return {
    pontosCadastro: cfg.pontosCadastro,
    pontosPorSessao: cfg.pontosPorSessao,
    pontosPorPacote: cfg.pontosPorPacote,
    cashbackPorIndicacao: cfg.cashbackPorIndicacao,
    validadeCreditoMeses: cfg.validadeCreditoMeses,
    vouchersAniversarioAno: cfg.vouchersAniversarioAno,
    // Sem faixa cadastrada o Clube não teria onde encaixar ninguém
    niveis: niveis.length
      ? niveis.map((n) => ({
          nome: n.nome,
          minimo: n.minimo,
          beneficio: n.beneficio,
        }))
      : PADRAO.niveis,
  };
}

/** Pontos que uma sessão desse serviço vale — o próprio serviço pode fugir do padrão global. */
export function pontosDoServico(
  servico: { pontos: number | null },
  regras: RegrasClube
) {
  return servico.pontos ?? regras.pontosPorSessao;
}

type ClienteTransacao = Prisma.TransactionClient;

/**
 * Único caminho para mudar pontos ou cashback de um paciente.
 *
 * O saldo em Paciente é lido o tempo todo (Clube, admin, indicadores), então
 * fica como cópia rápida — mas nunca muda sozinho. Todo crédito ou débito
 * passa por aqui, dentro de uma transação: grava o lançamento (quem, quanto,
 * por quê) e soma no saldo no mesmo commit. Sem isso, saldo e histórico
 * divergem na primeira falha no meio do caminho.
 */
export async function lancarClube(
  tx: ClienteTransacao,
  dados: {
    pacienteId: string;
    tipo: "PONTOS" | "CASHBACK";
    valor: number;
    motivo: string;
    origem: "SESSAO" | "INDICACAO" | "AJUSTE" | "RESGATE" | "CADASTRO" | "PACOTE";
    autor?: string | null;
    agendamentoId?: string;
    indicacaoId?: string;
  }
) {
  const { pacienteId, tipo, valor, motivo, origem, autor, agendamentoId, indicacaoId } =
    dados;

  await tx.lancamentoClube.create({
    data: {
      pacienteId,
      tipo,
      valor,
      motivo,
      origem,
      autor: autor || null,
      agendamentoId,
      indicacaoId,
    },
  });

  await tx.paciente.update({
    where: { id: pacienteId },
    data:
      tipo === "PONTOS"
        ? { pontos: { increment: valor } }
        : { cashback: { increment: valor } },
  });
}

export function nivelDe(pontos: number, regras: RegrasClube) {
  const atual = [...regras.niveis].reverse().find((n) => pontos >= n.minimo)!;
  const proximo = regras.niveis.find((n) => n.minimo > pontos);
  const progresso = proximo
    ? ((pontos - atual.minimo) / (proximo.minimo - atual.minimo)) * 100
    : 100;
  return { atual, proximo, progresso };
}

/** Como se acumula — o texto acompanha os números configurados */
export function comoFunciona(regras: RegrasClube) {
  return [
    {
      titulo: "Cada sessão vira ponto",
      texto: `A cada atendimento realizado você soma ${regras.pontosPorSessao} pontos, sem precisar pedir nada.`,
    },
    {
      titulo: "Indicação vira dinheiro",
      texto: `Quando alguém que você indicou faz a primeira sessão, você ganha R$ ${regras.cashbackPorIndicacao.toLocaleString("pt-BR")} de cashback.`,
    },
    {
      titulo: "Cashback abate a sessão",
      texto:
        "O valor acumulado desconta direto no pagamento da próxima sessão. Sem prazo para usar.",
    },
    {
      titulo: "Pontos sobem de nível",
      texto:
        "Conforme os pontos somam, você muda de nível e destrava vantagens novas.",
    },
  ];
}

/**
 * Monta o link de indicação e a mensagem pronta para o paciente disparar.
 * O código vai na URL para a recepção saber quem indicou quando a pessoa
 * chegar pelo formulário de contato.
 */
export function convite(codigo: string, origem: string) {
  const link = `${origem}/clube?indicacao=${encodeURIComponent(codigo)}`;
  const texto =
    `Oi! Eu me trato na Vitapraxis, em ${CLINICA.endereco.bairro}, e queria te indicar.\n\n` +
    `São quiropraxia, massoterapia, acupuntura, nutrição e mais — com equipe multidisciplinar.\n\n` +
    `Usando meu código ${codigo} você entra no Clube já com benefício. Dá uma olhada:\n${link}`;

  return {
    link,
    texto,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(texto)}`,
  };
}
