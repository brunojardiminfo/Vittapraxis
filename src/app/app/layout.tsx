import { redirect } from "next/navigation";
import { HOME_POR_PAPEL, usuarioAtual } from "@/lib/auth";
import { sair } from "@/app/actions/auth";
import { AppNav } from "@/components/app-nav";

function iniciaisDe(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await usuarioAtual();

  // O middleware só checa a presença do cookie; a validação real é aqui.
  if (!u) redirect("/entrar?proximo=/app");
  if (u.papel !== "PACIENTE") redirect(HOME_POR_PAPEL[u.papel]);

  return (
    <div className="lg:grid lg:grid-cols-[272px_1fr]">
      <AppNav nome={u.nome} iniciais={iniciaisDe(u.nome)} sair={sair} />
      <main className="mx-auto w-full max-w-5xl px-5 pb-20 pt-8 lg:px-11">
        {children}
      </main>
    </div>
  );
}
