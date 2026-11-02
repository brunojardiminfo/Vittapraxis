"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { gerarHash, senhaProvisoria, usuarioAtual } from "@/lib/auth";
import { mensagemAcesso } from "@/lib/acesso";
import { linkWhatsapp } from "@/lib/whatsapp";

const telefone = z
  .string()
  .trim()
  .max(20)
  .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, {
    message: "Telefone precisa ter DDD.",
  });

const NovoPacienteSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  telefone,
  whatsapp: telefone,
  dataNascimento: z.string().trim().optional(),
  endereco: z.string().trim().max(200).optional(),
  /// Código de quem indicou, se a pessoa chegou por convite do Clube
  indicadoPor: z.string().trim().max(40).optional(),
});

export type EstadoNovoPaciente = {
  ok?: boolean;
  erro?: string;
  criado?: {
    nome: string;
    email: string;
    codigo: string;
    senha: string;
    mensagem: string;
    whatsapp: string | null;
  };
};

/**
 * Monta um código curto e legível para o convite do Clube.
 *
 * Nasce do primeiro nome mais quatro dígitos, porque o paciente vai ditar
 * isso no WhatsApp — um cuid seria impossível de passar por voz. O sufixo
 * aleatório evita colisão entre dois "Marias".
 */
function gerarCodigo(nome: string) {
  const base = (nome.trim().split(/\s+/)[0] ?? "")
    .normalize("NFD")
    .toUpperCase()
    // Sobra só A–Z: o NFD já separou o acento da letra, e isto varre os
    // combinantes junto com espaço, hífen e apóstrofo
    .replace(/[^A-Z]/g, "")
    .slice(0, 10);
  const sufixo = Math.floor(1000 + Math.random() * 9000);
  return `${base || "VITA"}-${sufixo}`;
}

function vazioParaNulo(v: string | undefined) {
  return v && v.trim() !== "" ? v.trim() : null;
}

/**
 * Cadastra um paciente. Era o buraco que travava tudo: sem isto, ninguém
 * entrava na plataforma fora do seed, e a indicação nunca fechava o ciclo
 * porque a pessoa indicada não existia como paciente.
 *
 * Quando vem com o código de quem indicou, amarra a indicação ao novo
 * paciente — assim a primeira sessão dele libera o cashback automaticamente.
 */
export async function criarPaciente(
  _estado: EstadoNovoPaciente,
  formData: FormData
): Promise<EstadoNovoPaciente> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = NovoPacienteSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    dataNascimento: formData.get("dataNascimento") || undefined,
    endereco: formData.get("endereco") || undefined,
    indicadoPor: formData.get("indicadoPor") || undefined,
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const d = parsed.data;
  const email = d.email.toLowerCase();

  const jaExiste = await db.usuario.findUnique({ where: { email } });
  if (jaExiste) return { erro: "Já existe uma conta com esse e-mail." };

  // Quem indicou precisa existir antes de criarmos qualquer coisa, senão o
  // paciente nasce com um vínculo que aponta para o vazio
  let padrinhoId: string | null = null;
  if (d.indicadoPor) {
    const padrinho = await db.paciente.findUnique({
      where: { codigoIndicacao: d.indicadoPor.toUpperCase() },
      select: { id: true },
    });
    if (!padrinho) return { erro: "Código de indicação não encontrado." };
    padrinhoId = padrinho.id;
  }

  // Colisão de código é rara mas possível; tentar de novo é mais simples que
  // travar o cadastro
  let codigo = gerarCodigo(d.nome);
  for (let i = 0; i < 5; i++) {
    const usado = await db.paciente.findUnique({
      where: { codigoIndicacao: codigo },
      select: { id: true },
    });
    if (!usado) break;
    codigo = gerarCodigo(d.nome);
  }

  const nascimento = d.dataNascimento ? new Date(d.dataNascimento) : null;
  // A clínica não escolhe a senha de ninguém: sai uma provisória, e a pessoa
  // cria a dela no primeiro acesso
  const senha = senhaProvisoria();

  const paciente = await db.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        email,
        nome: d.nome,
        papel: "PACIENTE",
        senhaHash: await gerarHash(senha),
        trocarSenha: true,
      },
    });

    const novo = await tx.paciente.create({
      data: {
        usuarioId: usuario.id,
        telefone: vazioParaNulo(d.telefone),
        whatsapp: vazioParaNulo(d.whatsapp),
        dataNascimento:
          nascimento && !Number.isNaN(nascimento.getTime()) ? nascimento : null,
        endereco: vazioParaNulo(d.endereco),
        codigoIndicacao: codigo,
      },
    });

    if (padrinhoId) {
      await tx.indicacao.create({
        data: {
          pacienteId: padrinhoId,
          nome: d.nome,
          status: "PENDENTE",
          indicadoId: novo.id,
        },
      });
    }

    return novo;
  });

  revalidatePath("/admin/pacientes");
  revalidatePath("/admin");

  const mensagem = mensagemAcesso({ nome: d.nome, email, senha, papel: "PACIENTE" });

  return {
    ok: true,
    criado: {
      nome: d.nome,
      email,
      codigo: paciente.codigoIndicacao,
      senha,
      mensagem,
      whatsapp: linkWhatsapp(d.whatsapp || d.telefone, mensagem),
    },
  };
}

const EditarSchema = z.object({
  id: z.string().min(1),
  telefone,
  whatsapp: telefone,
  dataNascimento: z.string().trim().optional(),
  endereco: z.string().trim().max(200).optional(),
  emergenciaNome: z.string().trim().max(120).optional(),
  emergenciaFone: telefone,
});

export type EstadoEdicao = { ok?: boolean; erro?: string };

/** A recepção corrige contato do paciente sem depender de ele entrar no app. */
export async function editarPaciente(
  _estado: EstadoEdicao,
  formData: FormData
): Promise<EstadoEdicao> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = EditarSchema.safeParse({
    id: formData.get("id"),
    telefone: formData.get("telefone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    dataNascimento: formData.get("dataNascimento") || undefined,
    endereco: formData.get("endereco") || undefined,
    emergenciaNome: formData.get("emergenciaNome") || undefined,
    emergenciaFone: formData.get("emergenciaFone") ?? "",
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const d = parsed.data;
  const nascimento = d.dataNascimento ? new Date(d.dataNascimento) : null;

  await db.paciente.update({
    where: { id: d.id },
    data: {
      telefone: vazioParaNulo(d.telefone),
      whatsapp: vazioParaNulo(d.whatsapp),
      dataNascimento:
        nascimento && !Number.isNaN(nascimento.getTime()) ? nascimento : null,
      endereco: vazioParaNulo(d.endereco),
      emergenciaNome: vazioParaNulo(d.emergenciaNome),
      emergenciaFone: vazioParaNulo(d.emergenciaFone),
    },
  });

  revalidatePath("/admin/pacientes");
  return { ok: true };
}

const AjusteSchema = z.object({
  id: z.string().min(1),
  tipo: z.enum(["PONTOS", "CASHBACK"]),
  valor: z
    .string()
    .trim()
    .transform((v) => v.replace(/\./g, "").replace(",", "."))
    .pipe(z.coerce.number().refine((n) => n !== 0, "Informe um valor.")),
  motivo: z.string().trim().min(3, "Explique o motivo do ajuste."),
});

export type EstadoAjuste = { ok?: boolean; erro?: string };

/**
 * Ajuste manual de pontos ou cashback — positivo credita, negativo debita.
 *
 * Existe para corrigir erro e honrar exceção combinada no balcão. Passa pelo
 * mesmo lançamento de tudo, com o nome de quem mexeu e o motivo, para que
 * meses depois seja possível explicar ao paciente por que o saldo mudou.
 */
export async function ajustarClube(
  _estado: EstadoAjuste,
  formData: FormData
): Promise<EstadoAjuste> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = AjusteSchema.safeParse({
    id: formData.get("id"),
    tipo: formData.get("tipo"),
    valor: formData.get("valor"),
    motivo: formData.get("motivo"),
  });

  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { id, tipo, valor, motivo } = parsed.data;
  // Pontos são inteiros; aceitar 10,5 ponto criaria saldo que não fecha
  const quantia = tipo === "PONTOS" ? Math.trunc(valor) : valor;

  const paciente = await db.paciente.findUnique({
    where: { id },
    select: { pontos: true, cashback: true },
  });
  if (!paciente) return { erro: "Paciente não encontrado." };

  const saldo = tipo === "PONTOS" ? paciente.pontos : paciente.cashback;
  if (saldo + quantia < 0) {
    return { erro: `Saldo insuficiente: o paciente tem ${saldo}.` };
  }

  const { lancarClube } = await import("@/lib/clube");
  await db.$transaction(async (tx) => {
    await lancarClube(tx, {
      pacienteId: id,
      tipo,
      valor: quantia,
      motivo,
      origem: "AJUSTE",
      autor: u.nome,
    });
  });

  revalidatePath("/admin/pacientes");
  revalidatePath("/app/beneficios");
  return { ok: true };
}
