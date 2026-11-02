"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BotaoLink } from "@/components/ui";

const LINKS = [
  { href: "/quem-somos", texto: "Quem Somos" },
  { href: "/kleber-fontolan", texto: "Dr. Kleber" },
  { href: "/especialidades", texto: "Especialidades" },
  { href: "/#equipe", texto: "Equipe" },
  { href: "/clube", texto: "Clube" },
  { href: "/#catalogo", texto: "Serviços" },
  { href: "/galeria", texto: "Galeria" },
  { href: "/vale-presente", texto: "Vale-presente" },
  { href: "/contato", texto: "Contato" },
];

/**
 * Cabeçalho do site público.
 *
 * O menu inteiro só aparece em 1280px porque é a largura em que ele cabe de
 * verdade: com o logo em tamanho de marca e nove destinos, a fila pedia cerca
 * de 1285px e, liberada em 1024px, empurrava "Contato" e o botão do portal
 * para fora da tela. Abaixo disso entra o painel — que antes não existia, e
 * deixava quem abria pelo celular sem navegação alguma.
 */
export function CabecalhoSite() {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  // Trocar de página com o painel aberto deixaria o menu cobrindo a tela nova
  useEffect(() => setAberto(false), [caminho]);

  // Com o painel aberto, rolar o fundo dá a impressão de que o site escapou
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3 lg:px-8">
        {/* Só o símbolo: a versão com o nome repetia na barra o que o hero já
            diz em tamanho grande, e empurrava os links para fora da tela. */}
        <Link
          href="/"
          aria-label="Vitapraxis — início"
          className="shrink-0 transition-opacity hover:opacity-75"
        >
          <Image
            src="/marca/simbolo-dourado.png"
            alt="Vitapraxis"
            width={1179}
            height={1081}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-5 text-sm font-medium xl:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="whitespace-nowrap text-muted transition-colors hover:text-accent"
              >
                {l.texto}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <BotaoLink href="/entrar" tamanho="sm" className="hidden sm:inline-flex">
            Entrar no Portal do Cliente
          </BotaoLink>

          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="rounded-xl border border-line p-2.5 text-muted transition-colors hover:border-accent hover:text-accent xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              {aberto ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Painel dentro do próprio cabeçalho, que é sticky: assim ele desce
          colado na barra sem precisar saber a altura dela. */}
      {aberto ? (
        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-bg px-6 pb-8 pt-1 lg:px-8 xl:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setAberto(false)}
                  className="block border-b border-line py-3.5 text-[0.95rem] font-medium transition-colors hover:text-accent"
                >
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>

          <BotaoLink
            href="/entrar"
            className="mx-auto mt-6 flex w-full max-w-6xl justify-center sm:hidden"
          >
            Entrar no Portal do Cliente
          </BotaoLink>
        </div>
      ) : null}
    </header>
  );
}
