"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";
import { lancarClube, regrasDoClube } from "@/lib/clube";

/** Primeiro e último instante do mês de uma data. */
function limitesDoMes(d: Date) {
  return {
    inicio: new Date(d.getFullYear(), d.getMonth(), 1),
    fim: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
  };
}

/**
 * Emite os vouchers de aniversário do mês.
 *
 * Roda sob demanda, pelo botão do admin, e não por agendador: a clínica é
 * pequena e um job noturno seria uma peça a mais para manter no ar. Reexecutar
 * é seguro — quem já recebeu no ano é pulado.
 *
 * A validade termina no fim do mês de aniversário, como o PDF pede.
 */
export async function emitirVouchersAniversario() {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const hoje = new Date();
  const mes = hoje.getMonth();
  const { fim } = limitesDoMes(hoje);
  const regras = await regrasDoClube();
  if (regras.vouchersAniversarioAno <= 0) return;

  const aniversariantes = await db.paciente.findMany({
    where: { dataNascimento: { not: null } },
    select: {
      id: true,
      dataNascimento: true,
      usuario: { select: { nome: true } },
    },
  });

  const inicioAno = new Date(hoje.getFullYear(), 0, 1);

  for (const p of aniversariantes) {
    if (!p.dataNascimento || p.dataNascimento.getMonth() !== mes) continue;

    const jaTem = await db.voucher.count({
      where: {
        pacienteId: p.id,
        tipo: "ANIVERSARIO",
        criadoEm: { gte: inicioAno },
      },
    });
    if (jaTem >= regras.vouchersAniversarioAno) continue;

    await db.voucher.create({
      data: {
        pacienteId: p.id,
        tipo: "ANIVERSARIO",
        titulo: "Voucher de aniversário",
        descricao:
          "Desconto nos serviços participantes. Uso pessoal e intransferível, não cumulativo com outras promoções.",
        validoAte: fim,
      },
    });
  }

  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
}

const ResgateSchema = z.object({
  id: z.string().min(1),
  observacao: z.string().trim().max(200).optional(),
});

export type EstadoResgate = { ok?: boolean; erro?: string };

/**
 * A recepção marca o voucher como usado.
 *
 * Quando o voucher carrega valor em reais, o mesmo clique debita o saldo do
 * paciente pelo lançamento de sempre — assim o extrato explica para onde foi
 * o crédito, em vez de o saldo simplesmente encolher.
 */
export async function usarVoucher(
  _estado: EstadoResgate,
  formData: FormData
): Promise<EstadoResgate> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = ResgateSchema.safeParse({
    id: formData.get("id"),
    observacao: formData.get("observacao") || undefined,
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const v = await db.voucher.findUnique({ where: { id: parsed.data.id } });
  if (!v) return { erro: "Voucher não encontrado." };
  if (v.status !== "DISPONIVEL") return { erro: "Esse voucher já foi usado." };
  if (v.validoAte < new Date()) {
    await db.voucher.update({
      where: { id: v.id },
      data: { status: "EXPIRADO" },
    });
    return { erro: "Esse voucher venceu." };
  }

  await db.$transaction(async (tx) => {
    await tx.voucher.update({
      where: { id: v.id },
      data: {
        status: "USADO",
        usadoEm: new Date(),
        usadoPor: u.nome,
        descricao: parsed.data.observacao
          ? `${v.descricao ?? ""}\nUso: ${parsed.data.observacao}`.trim()
          : v.descricao,
      },
    });

    if (v.valor && v.valor > 0) {
      await lancarClube(tx, {
        pacienteId: v.pacienteId,
        tipo: "CASHBACK",
        valor: -v.valor,
        motivo: parsed.data.observacao
          ? `Resgate: ${v.titulo} — ${parsed.data.observacao}`
          : `Resgate: ${v.titulo}`,
        origem: "RESGATE",
        autor: u.nome,
      });
    }
  });

  revalidatePath("/admin/vouchers");
  revalidatePath("/admin/pacientes");
  revalidatePath("/app/beneficios");
  return { ok: true };
}

/**
 * Fecha os vouchers vencidos.
 *
 * O status é a fonte que as telas leem, então deixá-lo defasado faria um
 * voucher morto aparecer como disponível para a recepção.
 */
export async function expirarVencidos() {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  await db.voucher.updateMany({
    where: { status: "DISPONIVEL", validoAte: { lt: new Date() } },
    data: { status: "EXPIRADO" },
  });

  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
}

export async function cancelarVoucher(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const v = await db.voucher.findUnique({ where: { id } });
  if (!v || v.status !== "DISPONIVEL") return;

  await db.voucher.update({ where: { id }, data: { status: "CANCELADO" } });
  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
}

const ManualSchema = z
  .object({
    pacienteId: z.string().min(1, "Escolha o paciente."),
    titulo: z.string().trim().min(3, "Dê um nome ao voucher."),
    descricao: z.string().trim().max(300).optional(),
    forma: z.enum(["VALOR", "PERCENTUAL"]),
    valor: z.string().trim().optional(),
    percentual: z.string().trim().optional(),
    servicoId: z.string().trim().optional(),
    validoAte: z.string().min(1, "Informe até quando vale."),
  })
  .refine(
    (d) => (d.forma === "VALOR" ? Number(d.valor?.replace(",", ".")) > 0 : true),
    { message: "Informe o valor em reais.", path: ["valor"] }
  )
  .refine(
    (d) =>
      d.forma === "PERCENTUAL"
        ? Number(d.percentual) > 0 && Number(d.percentual) <= 100
        : true,
    { message: "O desconto vai de 1 a 100%.", path: ["percentual"] }
  );

export type EstadoManual = { ok?: boolean; erro?: string };

/**
 * Emissão avulsa pelo balcão.
 *
 * Existe porque nem todo benefício nasce de uma regra: o paciente pede no
 * balcão ou pelo WhatsApp, a clínica concede, e isso precisa virar registro
 * como qualquer outro — com validade e com o nome de quem emitiu.
 */
export async function emitirVoucherManual(
  _estado: EstadoManual,
  formData: FormData
): Promise<EstadoManual> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = ManualSchema.safeParse({
    pacienteId: formData.get("pacienteId"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || undefined,
    forma: formData.get("forma") ?? "VALOR",
    valor: formData.get("valor") || undefined,
    percentual: formData.get("percentual") || undefined,
    servicoId: formData.get("servicoId") || undefined,
    validoAte: formData.get("validoAte"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const d = parsed.data;
  const vence = new Date(`${d.validoAte}T23:59:59`);
  if (Number.isNaN(vence.getTime())) return { erro: "Data de validade inválida." };
  if (vence < new Date()) return { erro: "Essa validade já passou." };

  const existe = await db.paciente.findUnique({
    where: { id: d.pacienteId },
    select: { id: true },
  });
  if (!existe) return { erro: "Paciente não encontrado." };

  await db.voucher.create({
    data: {
      pacienteId: d.pacienteId,
      tipo: "CORTESIA",
      titulo: d.titulo,
      descricao: d.descricao
        ? `${d.descricao}\nEmitido por ${u.nome}.`
        : `Emitido por ${u.nome}.`,
      valor: d.forma === "VALOR" ? Number(d.valor!.replace(",", ".")) : null,
      percentual: d.forma === "PERCENTUAL" ? Number(d.percentual) : null,
      servicoId: d.servicoId || null,
      validoAte: vence,
    },
  });

  revalidatePath("/admin/vouchers");
  revalidatePath("/app/beneficios");
  return { ok: true };
}
