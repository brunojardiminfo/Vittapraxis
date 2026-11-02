"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Logo } from "@/components/ui";
import { IconeSair } from "@/components/icones";

const LINKS = [
  ["/admin", "Visão geral"],
  ["/admin/sessoes", "Sessões"],
  ["/admin/pacientes", "Pacientes"],
  ["/admin/servicos", "Serviços"],
  ["/admin/equipe", "Equipe"],
  ["/admin/destaques", "Ofertas"],
  ["/admin/biblioteca", "Biblioteca"],
  ["/admin/feedback", "Feedback"],
  ["/admin/vales", "Vales"],
  ["/admin/vouchers", "Vouchers"],
  ["/admin/sorteios", "Sorteios"],
  ["/admin/mensagens", "Mensagens"],
  ["/admin/configuracoes", "Clube"],
] as const;

/**
 * Cabeçalho do painel.
 *
 * A fila completa tem doze destinos e só cabe em telas largas; abaixo disso
 * ela virava invisível e o celular ficava sem navegação nenhuma. Agora o
 * botão de três pontos abre a mesma lista em painel.
 */
export function CabecalhoAdmin({
  nome,
  iniciais,
  sair,
}: {
  nome: string;
  iniciais: string;
  sair: () => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  // Navegar com o painel aberto deixaria o menu cobrindo a tela nova
  useEffect(() => setAberto(false), [caminho]);

  const voltarAoSite = (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-brand)_40%,transparent)] px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_14%,transparent)] dark:border-line"
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
        <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
      Ver o site
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-vp-green text-[var(--on-brand)] dark:bg-surface">
      <div className="flex items-center justify-between gap-4 px-6 py-3.5 lg:px-8">
        <Link href="/admin" className="flex items-center gap-3.5">
          <Logo altura={30} emFundoEscuro />
          <span className="hidden sm:block">
            <span className="block font-serif text-[1.02rem] leading-tight">
              Administração
            </span>
            <span className="block text-[0.72rem] text-vp-gold">
              Clínica Vitapraxis
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 2xl:flex">
          {LINKS.slice(1).map(([href, texto]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full border px-3.5 py-2 text-[0.78rem] font-semibold transition-colors ${
                caminho === href
                  ? "border-vp-gold bg-[color-mix(in_srgb,var(--color-vp-gold)_18%,transparent)] text-vp-gold"
                  : "border-[color-mix(in_srgb,var(--on-brand)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] dark:border-line"
              }`}
            >
              {texto}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden xl:inline-flex">{voltarAoSite}</span>

          <Link
            href="/trocar-senha"
            title="Trocar senha"
            className="hidden text-right sm:block"
          >
            <span className="block text-[0.86rem] font-semibold">{nome}</span>
            <span className="block text-[0.72rem] text-vp-gold">
              Acesso total
            </span>
          </Link>

          <Avatar iniciais={iniciais} tamanho={36} dourado />

          <form action={sair} className="hidden sm:block">
            <button
              type="submit"
              title="Sair"
              aria-label="Sair da conta"
              className="rounded-lg p-2 text-[color-mix(in_srgb,var(--on-brand)_70%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] hover:text-[var(--on-brand)] dark:text-muted dark:hover:bg-sunken dark:hover:text-ink"
            >
              <IconeSair className="h-4 w-4" />
            </button>
          </form>

          {/* Três pontos: o acesso ao painel em tudo que não for tela larga */}
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="rounded-lg border border-[color-mix(in_srgb,var(--on-brand)_30%,transparent)] p-2 transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] dark:border-line 2xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              {aberto ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <>
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {aberto ? (
        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-[color-mix(in_srgb,var(--on-brand)_18%,transparent)] px-6 pb-7 pt-4 lg:px-8 2xl:hidden dark:border-line">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LINKS.map(([href, texto]) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setAberto(false)}
                  className={`block rounded-xl border px-4 py-3 text-[0.9rem] font-semibold transition-colors ${
                    caminho === href
                      ? "border-vp-gold bg-[color-mix(in_srgb,var(--color-vp-gold)_18%,transparent)] text-vp-gold"
                      : "border-[color-mix(in_srgb,var(--on-brand)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-brand)_10%,transparent)] dark:border-line"
                  }`}
                >
                  {texto}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[color-mix(in_srgb,var(--on-brand)_18%,transparent)] pt-5 dark:border-line">
            {voltarAoSite}

            <Link
              href="/trocar-senha"
              className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-brand)_40%,transparent)] px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_14%,transparent)] dark:border-line"
            >
              Trocar senha
            </Link>

            <form action={sair} className="sm:hidden">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-brand)_40%,transparent)] px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_14%,transparent)] dark:border-line"
              >
                <IconeSair className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  );
}
