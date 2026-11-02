import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export { SESSION_COOKIE };
const SESSION_DIAS = 30;

/**
 * Três papéis. Ninguém se cadastra sozinho: a administração cria o acesso de
 * pacientes e profissionais, e o profissional enxerga só o portal clínico —
 * nada de financeiro nem de regras do Clube.
 */
export type Papel = "PACIENTE" | "PROFISSIONAL" | "ADMIN";

/** Rota inicial de cada papel — usada no login e nos redirecionamentos. */
export const HOME_POR_PAPEL: Record<Papel, string> = {
  PACIENTE: "/app",
  PROFISSIONAL: "/pro",
  ADMIN: "/admin",
};

export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  /** Id do registro Paciente — só existe quando papel é PACIENTE. */
  perfilId: string | null;
  /** Id do registro Profissional — só existe quando papel é PROFISSIONAL. */
  profissionalId: string | null;
  /** Senha provisória ainda não trocada */
  trocarSenha: boolean;
};

export async function verificarSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export async function gerarHash(senha: string) {
  return bcrypt.hash(senha, 10);
}

export async function criarSessao(usuarioId: string) {
  const token = randomBytes(32).toString("hex");
  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + SESSION_DIAS);

  await db.sessao.create({ data: { token, usuarioId, expiraEm } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.sessao.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

/** Usuário da requisição atual, ou null se não houver sessão válida. */
export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessao = await db.sessao.findUnique({
    where: { token },
    include: {
      usuario: {
        include: {
          paciente: { select: { id: true } },
          profissional: { select: { id: true } },
        },
      },
    },
  });

  if (!sessao || sessao.expiraEm < new Date()) return null;

  const u = sessao.usuario;

  // Carimbo de presença, para a gestão saber quem anda usando a plataforma.
  //
  // Só grava se o registro anterior tiver mais de quinze minutos: esta função
  // roda em toda página autenticada, e escrever a cada navegação daria uma
  // escrita por clique sem ganhar precisão nenhuma — a tela do admin mostra a
  // distância em dias.
  const agora = new Date();
  const defasado =
    !u.ultimoAcesso || agora.getTime() - u.ultimoAcesso.getTime() > 15 * 60_000;

  if (defasado) {
    // Sem await: a resposta da página não depende disso, e uma falha aqui não
    // pode derrubar a navegação de quem está logado.
    db.usuario
      .update({ where: { id: u.id }, data: { ultimoAcesso: agora } })
      .catch(() => {});
  }
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    papel: u.papel as Papel,
    perfilId: u.paciente?.id ?? null,
    profissionalId: u.profissional?.id ?? null,
    trocarSenha: u.trocarSenha,
  };
}

/**
 * Senha provisória que a administração entrega pelo WhatsApp.
 *
 * Sem caracteres que se confundem ao ditar ou ler no celular (0/O, 1/l/I),
 * e a pessoa troca no primeiro acesso de qualquer forma.
 */
export function senhaProvisoria() {
  const letras = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let s = "";
  for (const b of bytes) s += letras[b % letras.length];
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

/** Igual a usuarioAtual, mas lança se o papel não bater — para uso em páginas. */
export async function exigirPapel(papel: Papel): Promise<UsuarioSessao> {
  const u = await usuarioAtual();
  if (!u || u.papel !== papel) {
    throw new Error("NAO_AUTORIZADO");
  }
  return u;
}
