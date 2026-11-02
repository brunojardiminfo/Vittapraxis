"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { gerarHash, senhaProvisoria, usuarioAtual } from "@/lib/auth";
import { mensagemAcesso } from "@/lib/acesso";
import { linkWhatsapp } from "@/lib/whatsapp";

/** O que a tela precisa para entregar a senha provisória. */
export type EstadoAcesso = {
  ok?: boolean;
  erro?: string;
  entrega?: {
    email: string;
    senha: string;
    mensagem: string;
    whatsapp: string | null;
  };
};

const NovoAcessoSchema = z.object({
  profissionalId: z.string().min(1),
  email: z.string().trim().email("Informe um e-mail válido."),
  /// Só para montar o link de envio; o cadastro do profissional não guarda
  whatsapp: z.string().trim().max(20).optional(),
});

/**
 * Cria o login de um profissional da equipe.
 *
 * O e-mail é o identificador, como pediu a direção. A conta nasce ligada ao
 * cadastro que já aparece no site, para que os atendimentos que ele registrar
 * caiam no histórico certo.
 */
export async function criarAcessoProfissional(
  _estado: EstadoAcesso,
  formData: FormData
): Promise<EstadoAcesso> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const parsed = NovoAcessoSchema.safeParse({
    profissionalId: formData.get("profissionalId"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp") || undefined,
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const { profissionalId, whatsapp } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const profissional = await db.profissional.findUnique({
    where: { id: profissionalId },
  });
  if (!profissional) return { erro: "Profissional não encontrado." };
  if (profissional.usuarioId) {
    return { erro: "Esse profissional já tem acesso. Use “Gerar nova senha”." };
  }

  const jaExiste = await db.usuario.findUnique({ where: { email } });
  if (jaExiste) return { erro: "Já existe uma conta com esse e-mail." };

  const senha = senhaProvisoria();

  await db.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        email,
        nome: profissional.nome,
        papel: "PROFISSIONAL",
        senhaHash: await gerarHash(senha),
        trocarSenha: true,
      },
    });
    await tx.profissional.update({
      where: { id: profissionalId },
      data: { usuarioId: usuario.id },
    });
  });

  revalidatePath("/admin/equipe");

  const mensagem = mensagemAcesso({
    nome: profissional.nome,
    email,
    senha,
    papel: "PROFISSIONAL",
  });
  return {
    ok: true,
    entrega: { email, senha, mensagem, whatsapp: linkWhatsapp(whatsapp, mensagem) },
  };
}

/**
 * Gera uma senha provisória nova para quem esqueceu a sua.
 *
 * Não existe "esqueci minha senha" por e-mail: a clínica não mantém serviço
 * de envio, e a recepção já fala com todo mundo pelo WhatsApp. As sessões
 * abertas caem, e a pessoa cria a senha dela no próximo acesso.
 */
export async function redefinirSenha(
  _estado: EstadoAcesso,
  formData: FormData
): Promise<EstadoAcesso> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const usuarioId = String(formData.get("usuarioId") ?? "");
  const whatsappDigitado = String(formData.get("whatsapp") ?? "").trim();

  const alvo = await db.usuario.findUnique({
    where: { id: usuarioId },
    include: { paciente: { select: { whatsapp: true, telefone: true } } },
  });
  if (!alvo) return { erro: "Conta não encontrada." };
  // A administração não reseta a si mesma por aqui: perderia o acesso no meio
  if (alvo.papel === "ADMIN") return { erro: "Use “Trocar senha” no topo." };

  const senha = senhaProvisoria();
  await db.usuario.update({
    where: { id: alvo.id },
    data: { senhaHash: await gerarHash(senha), trocarSenha: true },
  });
  await db.sessao.deleteMany({ where: { usuarioId: alvo.id } });

  const mensagem = mensagemAcesso({
    nome: alvo.nome,
    email: alvo.email,
    senha,
    papel: alvo.papel === "PROFISSIONAL" ? "PROFISSIONAL" : "PACIENTE",
  });
  const numero =
    whatsappDigitado || alvo.paciente?.whatsapp || alvo.paciente?.telefone;

  return {
    ok: true,
    entrega: {
      email: alvo.email,
      senha,
      mensagem,
      whatsapp: linkWhatsapp(numero, mensagem),
    },
  };
}

/**
 * Tira o acesso do profissional ao portal.
 *
 * Apaga só o login: o cadastro continua no site, e os atendimentos que ele
 * registrou seguem no histórico dos pacientes.
 */
export async function removerAcessoProfissional(formData: FormData) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  const profissionalId = String(formData.get("profissionalId") ?? "");
  const p = await db.profissional.findUnique({ where: { id: profissionalId } });
  if (!p?.usuarioId) return;

  await db.usuario.delete({ where: { id: p.usuarioId } });
  revalidatePath("/admin/equipe");
}
