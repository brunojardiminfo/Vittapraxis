import { redirect } from "next/navigation";
import { HOME_POR_PAPEL, usuarioAtual } from "@/lib/auth";
import { db } from "@/lib/db";
import { sair } from "@/app/actions/auth";
import { CabecalhoPro } from "@/components/cabecalho-pro";

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await usuarioAtual();

  // O middleware só checa a presença do cookie; a validação real é aqui.
  if (!u) redirect("/entrar?proximo=/pro");
  if (u.papel !== "PROFISSIONAL") redirect(HOME_POR_PAPEL[u.papel]);
  if (u.trocarSenha) redirect("/trocar-senha");

  const pro = u.profissionalId
    ? await db.profissional.findUnique({
        where: { id: u.profissionalId },
        select: { nome: true, especialidade: true, iniciais: true, ativo: true },
      })
    : null;

  // Login sem cadastro na equipe, ou alguém que saiu dela: sem acesso clínico
  if (!pro || !pro.ativo) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="mb-3 text-[1.5rem]">Acesso indisponível</h1>
        <p className="mb-8 text-sm text-muted">
          Seu login não está ligado a um profissional ativo da equipe. Fale com
          a administração da clínica.
        </p>
        <form action={sair}>
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            Sair
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <CabecalhoPro
        nome={pro.nome}
        especialidade={pro.especialidade}
        iniciais={pro.iniciais}
        sair={sair}
      />
      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 lg:px-8">
        {children}
      </main>
    </>
  );
}
