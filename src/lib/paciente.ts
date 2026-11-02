import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

/**
 * Resolve o registro Paciente da sessão atual. Todas as páginas de /app
 * dependem disso, então centralizar evita repetir o guard em cada uma.
 */
export async function pacienteDaSessao() {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) redirect("/entrar");

  const paciente = await db.paciente.findUnique({
    where: { id: u.perfilId },
    include: { usuario: { select: { nome: true, email: true } } },
  });
  if (!paciente) redirect("/entrar");

  return paciente;
}

export function primeiroNome(nome: string) {
  return nome.split(" ")[0];
}
