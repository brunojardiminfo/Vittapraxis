import Link from "next/link";
import { redirect } from "next/navigation";
import { HOME_POR_PAPEL, usuarioAtual } from "@/lib/auth";
import { Logo } from "@/components/ui";
import { FormularioTroca } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trocar senha" };

export default async function TrocarSenhaPage() {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar?proximo=/trocar-senha");

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-14">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8">
          <Logo altura={36} emFundoEscuro />
        </div>

        <h1 className="text-[1.7rem]">
          {u.trocarSenha ? "Crie sua senha" : "Trocar senha"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {u.trocarSenha
            ? `Olá, ${u.nome.split(" ")[0]}! Você entrou com uma senha provisória. Escolha uma senha só sua para continuar.`
            : "Informe a senha atual e escolha uma nova."}
        </p>

        <FormularioTroca provisoria={u.trocarSenha} />

        {u.trocarSenha ? null : (
          <p className="mt-8 text-center text-sm text-muted">
            <Link
              href={HOME_POR_PAPEL[u.papel]}
              className="font-semibold text-accent hover:underline"
            >
              ← Voltar
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
