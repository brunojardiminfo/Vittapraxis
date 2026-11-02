"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { CLINICA } from "@/lib/clinica";

const PedidoSchema = z.object({
  servicoId: z.string().min(1, "Escolha um serviço."),
  profissionalId: z.string().optional(),
  periodo: z.enum(["MANHA", "TARDE", "QUALQUER"]),
  diasPreferidos: z.array(z.string()).optional(),
  observacao: z.string().max(500).optional(),
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

export type EstadoPedido = { erro?: string };

/**
 * Não existe fila interna para responder — quem agenda de fato é a clínica,
 * pelo Clínica Ágil. Aqui só registramos o pedido (para a administração
 * enxergar demanda) e mandamos o paciente direto pro WhatsApp, com a
 * mensagem já pronta para a recepção não perguntar tudo de novo.
 */
export async function criarPedido(
  _estado: EstadoPedido,
  formData: FormData
): Promise<EstadoPedido> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) {
    return { erro: "Sessão expirada. Entre novamente." };
  }

  const parsed = PedidoSchema.safeParse({
    servicoId: formData.get("servicoId"),
    profissionalId: formData.get("profissionalId") || undefined,
    periodo: formData.get("periodo") ?? "QUALQUER",
    diasPreferidos: formData.getAll("dias").map(String),
    observacao: formData.get("observacao") || undefined,
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  const { servicoId, profissionalId, periodo, diasPreferidos, observacao } =
    parsed.data;

  const servico = await db.servico.findUnique({ where: { id: servicoId } });
  if (!servico) return { erro: "Serviço não encontrado." };

  let profissional = null;
  if (profissionalId) {
    profissional = await db.profissional.findFirst({
      where: { id: profissionalId, servicos: { some: { id: servicoId } } },
    });
    if (!profissional) {
      return { erro: "Esse profissional não atende o serviço escolhido." };
    }
  }

  // Fica só como sinal de demanda para a administração — não é uma fila
  await db.pedidoAgendamento.create({
    data: {
      pacienteId: u.perfilId,
      servicoId,
      profissionalId: profissionalId || null,
      periodo,
      diasPreferidos: diasPreferidos?.length ? diasPreferidos.join("|") : null,
      observacao: observacao || null,
    },
  });

  const linhas = [
    `Olá! Sou ${u.nome} e gostaria de agendar uma sessão.`,
    "",
    `Serviço: ${servico.nome}`,
    profissional ? `Profissional: ${profissional.nome}` : null,
    `Período: ${ROTULO_PERIODO[periodo]}`,
    diasPreferidos?.length
      ? `Dias: ${diasPreferidos.map((d) => ROTULO_DIA[d] ?? d).join(", ")}`
      : null,
    observacao ? `Observação: ${observacao}` : null,
  ].filter((l): l is string => l !== null);

  const mensagem = encodeURIComponent(linhas.join("\n"));
  redirect(`${CLINICA.whatsapp.link}?text=${mensagem}`);
}
