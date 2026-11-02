import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";

/**
 * Id do profissional logado, para as páginas de /pro.
 *
 * O layout já barra quem não é profissional; isto só existe porque página e
 * layout rodam separados, e a página precisa do id para filtrar.
 */
export async function profissionalId() {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PROFISSIONAL" || !u.profissionalId) redirect("/entrar");
  return u.profissionalId;
}

/** Idade em anos completos. */
export function idade(nascimento: Date | null) {
  if (!nascimento) return null;
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const antes =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate());
  if (antes) anos--;
  return anos;
}
