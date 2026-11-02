import Link from "next/link";
import { CLINICA } from "@/lib/clinica";
import { MISSAO, PILARES, VALORES, VISAO } from "@/lib/institucional";
import { BotaoLink, Eyebrow } from "@/components/ui";
import { IconeCheck, IconeEstrela } from "@/components/icones";

export const metadata = {
  title: "Quem Somos",
  description:
    "Missão, visão e valores da Vitapraxis — clínica multidisciplinar de saúde e bem-estar no bairro Auxiliadora, em Porto Alegre.",
};

export default function QuemSomosPage() {
  return (
    <main>
      {/* ---------------- ABERTURA ----------------
          Sem foto: a direção pediu que as imagens vivessem só na Galeria, e
          que esta página fosse sustentada pela palavra. O que preenche aqui é
          o verde da marca e o espaço em volta do texto. */}
      <section className="border-b border-line bg-vp-green py-20 text-[var(--color-vp-cream)] lg:py-28 dark:bg-sunken dark:text-ink">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="mb-5 flex items-center justify-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-vp-gold">
            <span className="h-px w-6 bg-vp-gold" />
            Quem somos
            <span className="h-px w-6 bg-vp-gold" />
          </div>

          <h1 className="text-[clamp(2.1rem,4.4vw,3.2rem)] leading-[1.1] text-[var(--color-vp-cream)] dark:text-ink">
            Saúde, equilíbrio e bem-estar
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-[color-mix(in_srgb,var(--color-vp-cream)_82%,transparent)] dark:text-muted">
            {PILARES[0].texto}
          </p>
        </div>
      </section>

      {/* ---------------- MISSÃO E VISÃO ---------------- */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-3xl border border-line bg-line px-0 md:grid-cols-2 lg:mx-auto">
          <article className="bg-surface px-9 py-11">
            <Eyebrow>Missão</Eyebrow>
            <p className="text-[1.02rem] leading-relaxed text-muted">
              {MISSAO}
            </p>
          </article>

          <article className="bg-surface px-9 py-11">
            <Eyebrow>Visão</Eyebrow>
            <p className="text-[1.02rem] leading-relaxed text-muted">{VISAO}</p>
          </article>
        </div>
      </section>

      {/* ---------------- VALORES ---------------- */}
      <section className="border-y border-line bg-sunken py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Valores</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              O que sustenta cada atendimento
            </h2>
          </div>

          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VALORES.map((v) => (
              <li
                key={v.nome}
                className="rounded-2xl border border-line bg-surface p-7"
              >
                <IconeEstrela className="mb-4 h-4 w-4 text-accent" />
                <h3 className="mb-2 font-sans text-[0.98rem] font-semibold">
                  {v.nome}
                </h3>
                <p className="text-[0.88rem] leading-relaxed text-muted">
                  {v.texto}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- PILARES ----------------
          O primeiro já abriu a página, então aqui entram os outros três. */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Como trabalhamos</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              O padrão por trás da experiência
            </h2>
          </div>

          <div className="flex flex-col gap-px overflow-hidden rounded-3xl border border-line bg-line">
            {PILARES.slice(1).map((p) => (
              <article
                key={p.titulo}
                className="grid gap-4 bg-surface px-8 py-9 lg:grid-cols-[18rem_1fr] lg:gap-10 lg:px-10"
              >
                <h3 className="flex items-start gap-3 text-[1.15rem]">
                  <IconeCheck className="mt-1.5 h-4 w-4 shrink-0 text-accent" />
                  {p.titulo}
                </h3>
                <p className="leading-relaxed text-muted">{p.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CHAMADA FINAL ---------------- */}
      <section className="border-t border-line py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
            Venha conhecer de perto
          </h2>
          <p className="mx-auto mt-4 mb-9 text-muted">
            {CLINICA.endereco.completo}. {CLINICA.horario.resumo}.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <BotaoLink href="/contato">Agendar minha avaliação</BotaoLink>
            <Link
              href="/galeria"
              className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Ver a galeria
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
