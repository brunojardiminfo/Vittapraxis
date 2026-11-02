"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CLINICA } from "@/lib/clinica";
import { BotaoLink, Logo } from "@/components/ui";

export type Slide = {
  etiqueta: string;
  titulo: string;
  texto: string;
  imagem: string;
  /** Descrição da foto; vazia quando ela é só ambientação */
  alt: string;
  acao: { href: string; texto: string };
  /** Números que sustentam a promessa daquele slide */
  marcos?: { valor: string; rotulo: string }[];
};

const INTERVALO = 7000;

/**
 * Abertura do site em carrossel.
 *
 * Troca o texto e a foto de fundo, mas mantém o logo, os botões e o véu
 * parados: o que muda é o argumento, não o lugar das coisas — assim a pessoa
 * não precisa reencontrar o botão a cada volta.
 *
 * Todas as fotos ficam montadas e empilhadas, alternando só a opacidade. Com
 * `fill`, trocar o src provocaria um branco entre uma imagem e outra enquanto
 * a próxima carrega.
 */
export function HeroCarrossel({ slides }: { slides: Slide[] }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  const ir = useCallback(
    (passo: number) =>
      setAtual((i) => (i + passo + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (pausado || slides.length < 2) return;

    // Quem pediu menos movimento no sistema não quer um slide girando sozinho
    const menosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (menosMovimento) return;

    temporizador.current = setInterval(() => ir(1), INTERVALO);
    return () => {
      if (temporizador.current) clearInterval(temporizador.current);
    };
  }, [ir, pausado, slides.length]);

  const slide = slides[atual];

  const seta =
    "pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-[color-mix(in_srgb,var(--color-vp-cream)_32%,transparent)] text-[var(--color-vp-cream)] backdrop-blur-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-vp-cream)_16%,transparent)]";

  return (
    <section
      className="relative isolate flex min-h-[clamp(36rem,84vh,48rem)] items-center overflow-hidden py-20 lg:py-24"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques da Vitapraxis"
    >
      {slides.map((s, i) => (
        <Image
          key={s.imagem}
          src={s.imagem}
          alt={i === atual ? s.alt : ""}
          fill
          priority={i === 0}
          sizes="100vw"
          aria-hidden={i !== atual}
          className={`-z-20 object-cover transition-opacity duration-700 ${
            i === atual ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Véu fixo: mais fechado à esquerda, onde mora a leitura */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(100deg, rgba(8,8,7,0.88) 0%, rgba(8,8,7,0.72) 42%, rgba(8,8,7,0.38) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="max-w-2xl text-[var(--color-vp-cream)]">
          <div className="mb-8">
            <span className="block w-[min(100%,22rem)]">
              <Logo altura={96} emFundoEscuro />
            </span>
          </div>

          {/* aria-live: quem usa leitor de tela ouve o slide que entrou */}
          <div aria-live="polite" aria-atomic="true">
            <p className="mb-4 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-vp-gold">
              <span className="h-px w-6 bg-vp-gold" />
              {slide.etiqueta}
            </p>

            <h1 className="text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.08] text-[var(--color-vp-cream)]">
              {slide.titulo}
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[color-mix(in_srgb,var(--color-vp-cream)_84%,transparent)]">
              {slide.texto}
            </p>

            {slide.marcos ? (
              <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
                {slide.marcos.map((m) => (
                  <div key={m.rotulo}>
                    <dt className="font-serif text-[1.7rem] leading-none text-vp-gold">
                      {m.valor}
                    </dt>
                    <dd className="mt-1 text-[0.76rem] uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--color-vp-cream)_72%,transparent)]">
                      {m.rotulo}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {/* Fora do aria-live: os botões não mudam de lugar nem de função */}
          <div className="mt-9 flex flex-wrap gap-3.5">
            <BotaoLink href={slide.acao.href} variante="claro">
              {slide.acao.texto}
            </BotaoLink>
            <a
              href={CLINICA.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-vp-cream)_38%,transparent)] px-7 py-3.5 text-sm font-semibold text-[var(--color-vp-cream)] backdrop-blur-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-vp-cream)_14%,transparent)]"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Navegação */}
          <div className="mt-11 flex items-center gap-5">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => ir(-1)}
                aria-label="Destaque anterior"
                className={seta}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => ir(1)}
                aria-label="Próximo destaque"
                className={seta}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.imagem}
                  type="button"
                  onClick={() => setAtual(i)}
                  aria-label={`Ir para ${s.etiqueta}`}
                  aria-current={i === atual}
                  className={`h-1.5 rounded-full transition-all ${
                    i === atual
                      ? "w-8 bg-vp-gold"
                      : "w-1.5 bg-[color-mix(in_srgb,var(--color-vp-cream)_42%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-vp-cream)_70%,transparent)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Atalho para o conteúdo, já que a dobra toda é ocupada pelo carrossel */}
      <Link
        href="/#quem-somos-resumo"
        aria-hidden
        tabIndex={-1}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-[color-mix(in_srgb,var(--color-vp-cream)_55%,transparent)] transition-colors hover:text-[var(--color-vp-cream)] lg:block"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </Link>
    </section>
  );
}
