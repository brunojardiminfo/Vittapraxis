import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta } from "@/lib/format";
import { Vazio } from "@/components/ui";
import { incorporarVideo } from "@/lib/video";

export const dynamic = "force-dynamic";
export const metadata = { title: "Biblioteca de Saúde" };

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const todos = await db.conteudo.findMany({
    orderBy: { publicadoEm: "desc" },
  });

  const categorias = Array.from(new Set(todos.map((c) => c.categoria))).sort();
  const filtrados = categoria
    ? todos.filter((c) => c.categoria === categoria)
    : todos;

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Biblioteca de Saúde</h1>
        <p className="mt-1 text-sm text-muted">
          Conteúdos produzidos pela equipe Vitapraxis para o seu dia a dia
        </p>
      </header>

      <nav className="mb-7 flex flex-wrap gap-2.5">
        <Link
          href="/app/biblioteca"
          className={`rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
            !categoria
              ? "border-vp-green bg-vp-green text-[var(--on-brand)] dark:border-vp-gold dark:bg-vp-gold dark:text-vp-green-deep"
              : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
          }`}
        >
          Todos
        </Link>
        {categorias.map((c) => (
          <Link
            key={c}
            href={`/app/biblioteca?categoria=${encodeURIComponent(c)}`}
            className={`rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
              categoria === c
                ? "border-vp-green bg-vp-green text-[var(--on-brand)] dark:border-vp-gold dark:bg-vp-gold dark:text-vp-green-deep"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {filtrados.length === 0 ? (
        <Vazio>Nenhum conteúdo nesta categoria ainda.</Vazio>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtrados.map((c) => (
            <article
              key={c.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-accent"
            >
              {incorporarVideo(c.url) ? (
                <div className="relative aspect-video w-full bg-sunken">
                  <iframe
                    src={incorporarVideo(c.url)!}
                    title={c.titulo}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="h-1.5 bg-gradient-to-r from-vp-green to-vp-gold-deep" />
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-accent">
                    {c.tipo}
                  </span>
                  <span className="text-[0.72rem] text-muted">
                    {c.categoria}
                  </span>
                </div>
                <h2 className="mb-2 text-[1.1rem]">{c.titulo}</h2>
                <p className="mb-3 text-[0.88rem] font-medium text-muted">
                  {c.resumo}
                </p>
                <p className="text-[0.86rem] leading-relaxed text-muted">
                  {c.corpo}
                </p>
                {c.url && !incorporarVideo(c.url) ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-[0.84rem] font-semibold text-accent hover:underline"
                  >
                    Assistir ao vídeo →
                  </a>
                ) : null}

                <time className="mt-4 pt-3 text-[0.74rem] text-muted">
                  {dataCurta(c.publicadoEm)}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
