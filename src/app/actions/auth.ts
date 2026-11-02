"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  HOME_POR_PAPEL,
  criarSessao,
  encerrarSessao,
  gerarHash,
  usuarioAtual,
  verificarSenha,
  type Papel,
} from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
  proximo: z.string().optional(),
});

export type EstadoLogin = { erro?: string };

export async function entrar(
  _estado: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    proximo: formData.get("proximo") || undefined,
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  const { email, senha, proximo } = parsed.data;

  const usuario = await db.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Mensagem única para e-mail inexistente e senha errada, para não revelar
  // quais e-mails existem na base.
  if (!usuario || !(await verificarSenha(senha, usuario.senhaHash))) {
    return { erro: "E-mail ou senha incorretos." };
  }

  await criarSessao(usuario.id);

  // Senha provisória: troca antes de qualquer outra tela
  if (usuario.trocarSenha) redirect("/trocar-senha");

  // "//outro-site" também começa com barra e levaria para fora daqui
  const destino =
    proximo && proximo.startsWith("/") && !proximo.startsWith("//")
      ? proximo
      : (HOME_POR_PAPEL[usuario.papel as Papel] ?? "/app");

  redirect(destino);
}

export async function sair() {
  await encerrarSessao();
  redirect("/entrar");
}

const TrocaSchema = z
  .object({
    atual: z.string().min(1, "Informe a senha atual."),
    nova: z.string().min(8, "A nova senha precisa de ao menos 8 caracteres."),
    confirmacao: z.string(),
  })
  .refine((d) => d.nova === d.confirmacao, {
    message: "A confirmação não bate com a nova senha.",
  })
  .refine((d) => d.nova !== d.atual, {
    message: "A nova senha precisa ser diferente da atual.",
  });

export type EstadoTroca = { erro?: string };

/**
 * Troca de senha de qualquer papel.
 *
 * É a mesma tela para a troca obrigatória do primeiro acesso e para quem
 * quer trocar por conta própria. As outras sessões abertas caem junto: se a
 * troca foi por suspeita de vazamento, quem estava usando a senha antiga não
 * pode continuar logado.
 */
export async function trocarSenha(
  _estado: EstadoTroca,
  formData: FormData
): Promise<EstadoTroca> {
  const u = await usuarioAtual();
  if (!u) return { erro: "Sessão expirada. Entre novamente." };

  const parsed = TrocaSchema.safeParse({
    atual: formData.get("atual"),
    nova: formData.get("nova"),
    confirmacao: formData.get("confirmacao"),
  });
  if (!parsed.success) return { erro: parsed.error.issues[0].message };

  const usuario = await db.usuario.findUnique({ where: { id: u.id } });
  if (!usuario) return { erro: "Conta não encontrada." };

  if (!(await verificarSenha(parsed.data.atual, usuario.senhaHash))) {
    return { erro: "A senha atual está incorreta." };
  }

  await db.usuario.update({
    where: { id: u.id },
    data: { senhaHash: await gerarHash(parsed.data.nova), trocarSenha: false },
  });
  await db.sessao.deleteMany({ where: { usuarioId: u.id } });
  await criarSessao(u.id);

  redirect(`${HOME_POR_PAPEL[u.papel]}?senha=ok`);
}
