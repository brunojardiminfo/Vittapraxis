"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { moeda } from "@/lib/format";
import { CLINICA } from "@/lib/clinica";

const ValePresenteSchema = z
  .object({
    deNome: z.string().trim().min(2, "Conte seu nome."),
    deContato: z.string().trim().min(8, "Informe um telefone ou e-mail para contato."),
    paraNome: z.string().trim().min(2, "Conte o nome de quem vai receber."),
    tipo: z.enum(["VALOR", "SERVICO"]),
    valor: z.coerce.number().positive().optional(),
    servicoId: z.string().optional(),
    mensagem: z.string().max(300).optional(),
  })
  .refine(
    (d) => (d.tipo === "VALOR" ? d.valor !== undefined && d.valor > 0 : true),
    { message: "Informe o valor do vale-presente.", path: ["valor"] }
  )
  .refine((d) => (d.tipo === "SERVICO" ? !!d.servicoId : true), {
    message: "Escolha o serviço do presente.",
    path: ["servicoId"],
  });

export type EstadoVale = { erro?: string };

/**
 * Mesma mecânica do pedido de horário: não emitimos nada por aqui, só
 * registramos a intenção (para a administração ver a demanda) e mandamos
 * quem está presenteando direto para o WhatsApp, com a mensagem pronta. Quem
 * de fato emite o vale — e cobra — é a recepção, pelo Clínica Ágil.
 */
export async function criarPedidoVale(
  _estado: EstadoVale,
  formData: FormData
): Promise<EstadoVale> {
  const parsed = ValePresenteSchema.safeParse({
    deNome: formData.get("deNome"),
    deContato: formData.get("deContato"),
    paraNome: formData.get("paraNome"),
    tipo: formData.get("tipo") ?? "VALOR",
    valor: formData.get("valor") || undefined,
    servicoId: formData.get("servicoId") || undefined,
    mensagem: formData.get("mensagem") || undefined,
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  const { deNome, deContato, paraNome, tipo, valor, servicoId, mensagem } =
    parsed.data;

  let servico = null;
  if (tipo === "SERVICO" && servicoId) {
    servico = await db.servico.findUnique({ where: { id: servicoId } });
    if (!servico) return { erro: "Serviço não encontrado." };
  }

  await db.pedidoVale.create({
    data: {
      deNome,
      deContato,
      paraNome,
      valor: tipo === "VALOR" ? valor : null,
      servicoId: tipo === "SERVICO" ? servicoId : null,
      servicoNome: servico?.nome ?? null,
      mensagem: mensagem || null,
    },
  });

  const linhas = [
    `Olá! Sou ${deNome} e quero dar um vale-presente Vitapraxis.`,
    "",
    `Para: ${paraNome}`,
    tipo === "VALOR" && valor
      ? `Valor: ${moeda(valor)}`
      : `Serviço: ${servico?.nome}`,
    mensagem ? `Mensagem no cartão: ${mensagem}` : null,
    "",
    `Meu contato: ${deContato}`,
  ].filter((l): l is string => l !== null);

  const texto = encodeURIComponent(linhas.join("\n"));
  redirect(`${CLINICA.whatsapp.link}?text=${texto}`);
}

/** Letras e números sem os que se confundem ao ditar: O/0, I/1, S/5. */
const ALFABETO = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";

/**
 * Código curto que quem recebe apresenta no balcão.
 *
 * Vai ser ditado por telefone e digitado à mão, então fora da tabela ficam os
 * caracteres que as pessoas trocam entre si ao soletrar.
 */
function gerarCodigo() {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `VP-${s}`;
}

const EmissaoSchema = z.object({
  id: z.string().min(1),
  validoAte: z.string().min(1, "Informe até quando o vale vale."),
  pacienteId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
});

export type EstadoEmissao = { ok?: boolean; erro?: string; codigo?: string };

/**
 * Emite o vale: gera o código, fixa a validade e, quando o presenteado já é
 * paciente, cria o voucher que aparece no portal dele.
 *
 * Quem ganha um presente costuma ainda não ter conta — é o que o presente
 * tenta mudar. Por isso o código existe sozinho, e o vínculo com o portal é
 * um extra para quando já houver cadastro.
 */
export async function emitirVale(
  _estado: EstadoEmissao,
  formData: FormData
): Promise<EstadoEmissao> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = EmissaoSchema.safeParse({
    id: formData.get("id"),
    validoAte: formData.get("validoAte"),
    pacienteId: formData.get("pacienteId") ?? undefined,
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, validoAte, pacienteId } = parsed.data;

  const pedido = await db.pedidoVale.findUnique({ where: { id } });
  if (!pedido) return { erro: "Pedido não encontrado." };
  if (pedido.status !== "NOVO") return { erro: "Esse vale já foi resolvido." };

  const vence = new Date(`${validoAte}T23:59:59`);
  if (Number.isNaN(vence.getTime())) return { erro: "Data de validade inválida." };
  if (vence < new Date()) return { erro: "Essa validade já passou." };

  // Colisão de código é improvável, mas tentar de novo é mais barato que
  // devolver um erro para quem está com o cliente na frente
  let codigo = gerarCodigo();
  for (let i = 0; i < 5; i++) {
    const usado = await db.pedidoVale.findUnique({
      where: { codigo },
      select: { id: true },
    });
    if (!usado) break;
    codigo = gerarCodigo();
  }

  const titulo = pedido.servicoNome
    ? `Vale-presente: ${pedido.servicoNome}`
    : `Vale-presente de ${moeda(pedido.valor ?? 0)}`;

  await db.$transaction(async (tx) => {
    let voucherId: string | null = null;

    if (pacienteId) {
      const voucher = await tx.voucher.create({
        data: {
          pacienteId,
          tipo: "PRESENTE",
          titulo,
          descricao: `Presente de ${pedido.deNome}.${pedido.mensagem ? `\n"${pedido.mensagem}"` : ""}`,
          valor: pedido.valor,
          servicoId: pedido.servicoId,
          validoAte: vence,
        },
        select: { id: true },
      });
      voucherId = voucher.id;
    }

    await tx.pedidoVale.update({
      where: { id },
      data: {
        status: "EMITIDO",
        codigo,
        validoAte: vence,
        emitidoEm: new Date(),
        emitidoPor: u.nome,
        pacienteId,
        voucherId,
      },
    });
  });

  revalidatePath("/admin/vales");
  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
  return { ok: true, codigo };
}

/**
 * Registra que o vale foi usado no balcão.
 *
 * Quando existe voucher no portal, ele é fechado junto — senão o presenteado
 * continuaria vendo como disponível algo que já gastou.
 */
export async function usarVale(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const pedido = await db.pedidoVale.findUnique({ where: { id } });
  if (!pedido || pedido.status !== "EMITIDO") return;

  await db.$transaction(async (tx) => {
    await tx.pedidoVale.update({
      where: { id },
      data: { status: "USADO", usadoEm: new Date(), usadoPor: u.nome },
    });

    if (pedido.voucherId) {
      await tx.voucher.updateMany({
        where: { id: pedido.voucherId, status: "DISPONIVEL" },
        data: { status: "USADO", usadoEm: new Date(), usadoPor: u.nome },
      });
    }
  });

  revalidatePath("/admin/vales");
  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
}

/** Cancela o pedido, e o voucher junto quando já existir. */
export async function cancelarVale(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const pedido = await db.pedidoVale.findUnique({ where: { id } });
  if (!pedido || pedido.status === "USADO") return;

  await db.$transaction(async (tx) => {
    await tx.pedidoVale.update({ where: { id }, data: { status: "CANCELADO" } });

    if (pedido.voucherId) {
      await tx.voucher.updateMany({
        where: { id: pedido.voucherId, status: "DISPONIVEL" },
        data: { status: "CANCELADO" },
      });
    }
  });

  revalidatePath("/admin/vales");
  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
}
