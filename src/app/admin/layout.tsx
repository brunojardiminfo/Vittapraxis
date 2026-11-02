import { redirect } from "next/navigation";
import { HOME_POR_PAPEL, usuarioAtual } from "@/lib/auth";
import { sair } from "@/app/actions/auth";
import { CabecalhoAdmin } from "@/components/cabecalho-admin";

/** Duas primeiras letras do nome, para o avatar. */
function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const letras = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return letras.toUpperCase() || "VP";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar?proximo=/admin");
  if (u.papel !== "ADMIN") redirect(HOME_POR_PAPEL[u.papel]);
  if (u.trocarSenha) redirect("/trocar-senha");

  return (
    <>
      <CabecalhoAdmin
        nome={u.nome}
        iniciais={iniciaisDe(u.nome)}
        sair={sair}
      />

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        {children}
      </main>
    </>
  );
}
