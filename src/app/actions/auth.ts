"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  HOME_POR_PAPEL,
  criarSessao,
  encerrarSessao,
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

  const destino =
    proximo && proximo.startsWith("/")
      ? proximo
      : (HOME_POR_PAPEL[usuario.papel as Papel] ?? "/app");

  redirect(destino);
}

export async function sair() {
  await encerrarSessao();
  redirect("/entrar");
}
