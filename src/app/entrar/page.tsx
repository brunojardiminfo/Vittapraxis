import Link from "next/link";
import { redirect } from "next/navigation";
import { HOME_POR_PAPEL, usuarioAtual } from "@/lib/auth";
import { CLINICA } from "@/lib/clinica";
import { Logo } from "@/components/ui";
import { FormularioLogin } from "./formulario";

export const metadata = { title: "Entrar" };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo } = await searchParams;
  const u = await usuarioAtual();
  if (u) redirect(HOME_POR_PAPEL[u.papel]);

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_460px]">
      {/* Painel de marca — some no mobile para dar espaço ao formulário.
          O fundo é verde-escuro nos dois temas, mas --on-brand vira verde no
          escuro (lá a cor de marca é o dourado); sem o override o texto some. */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-vp-green p-14 text-[var(--on-brand)] lg:flex dark:text-vp-gold-pale">
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(187,167,134,0.35), transparent 70%)",
          }}
        />
        <div className="relative">
          <Logo altura={40} emFundoEscuro />
        </div>
        <div className="relative max-w-md">
          <p className="font-serif text-3xl leading-snug">
            Ambientes que inspiram bem-estar, projetados para transformar
            experiências.
          </p>
          <p className="mt-5 text-sm text-[color-mix(in_srgb,var(--on-brand)_75%,transparent)] dark:text-vp-gold-pale/75">
            {CLINICA.lema}
          </p>
        </div>
        <div className="relative flex gap-6 text-[0.7rem] uppercase tracking-[0.16em] text-vp-gold">
          <span>Saúde</span>
          <span>Longevidade</span>
          <span>Espiritualidade</span>
          <span>Equilíbrio</span>
        </div>
      </section>

      {/* Formulário */}
      <section className="flex flex-col justify-center px-6 py-14 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo altura={36} />
          </div>

          <h1 className="text-[1.7rem]">Entrar no Clube</h1>
          <p className="mt-2 text-sm text-muted">
            Acesse seu acompanhamento, agendamentos e benefícios.
          </p>

          <FormularioLogin proximo={proximo} />

          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/" className="font-semibold text-accent hover:underline">
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
