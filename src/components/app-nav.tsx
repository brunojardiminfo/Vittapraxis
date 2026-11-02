"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconeAgenda,
  IconeAjuda,
  IconeBemEstar,
  IconeBiblioteca,
  IconeChat,
  IconeEquipe,
  IconeEvolucao,
  IconeInicio,
  IconePerfil,
  IconePresente,
  IconeSair,
  IconeServicos,
} from "@/components/icones";
import { Avatar, Logo } from "@/components/ui";

type Item = {
  href: string;
  texto: string;
  Icone: (p: { className?: string }) => React.ReactElement;
};

const GRUPOS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: "Principal",
    itens: [
      { href: "/app", texto: "Início", Icone: IconeInicio },
      { href: "/app/agendamentos", texto: "Minha Agenda", Icone: IconeAgenda },
      { href: "/app/servicos", texto: "Catálogo de Serviços", Icone: IconeServicos },
      { href: "/app/equipe", texto: "Nossa Equipe", Icone: IconeEquipe },
    ],
  },
  {
    titulo: "Seu Progresso",
    itens: [
      { href: "/app/evolucao", texto: "Meu Bem-Estar", Icone: IconeEvolucao },
      { href: "/app/bem-estar", texto: "Índice de Bem-Estar", Icone: IconeBemEstar },
      { href: "/app/biblioteca", texto: "Biblioteca de Saúde", Icone: IconeBiblioteca },
      { href: "/app/beneficios", texto: "Clube de Benefícios", Icone: IconePresente },
    ],
  },
  {
    titulo: "Conta",
    itens: [
      { href: "/app/perfil", texto: "Meu Perfil", Icone: IconePerfil },
      { href: "/app/atendimento", texto: "Central de Atendimento", Icone: IconeAjuda },
      { href: "/app/feedback", texto: "Fale com a Direção", Icone: IconeChat },
    ],
  },
];

function estaAtivo(pathname: string, href: string) {
  // "/app" só casa exatamente, senão ficaria ativo em todas as subrotas
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

export function AppNav({
  nome,
  iniciais,
  sair,
}: {
  nome: string;
  iniciais: string;
  sair: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const conteudo = (
    <>
      <div className="mb-8">
        <Logo altura={36} emFundoEscuro />
      </div>

      <nav className="mb-auto flex-1">
        {GRUPOS.map((g) => (
          <div key={g.titulo} className="mb-5">
            <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--on-brand)_55%,transparent)] dark:text-muted">
              {g.titulo}
            </p>
            <ul>
              {g.itens.map(({ href, texto, Icone }) => {
                const ativo = estaAtivo(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setAberto(false)}
                      aria-current={ativo ? "page" : undefined}
                      className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.88rem] transition-colors ${
                        ativo
                          ? "bg-[color-mix(in_srgb,var(--color-vp-gold)_20%,transparent)] font-semibold text-vp-gold dark:text-accent"
                          : "text-[color-mix(in_srgb,var(--on-brand)_78%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-brand)_10%,transparent)] hover:text-[var(--on-brand)] dark:text-muted dark:hover:bg-sunken dark:hover:text-ink"
                      }`}
                    >
                      <Icone className="h-4 w-4 shrink-0" />
                      {texto}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Volta ao site com moldura: sem borda, virava mais um item perdido
          no meio da navegação, e era o que o paciente procurava para sair. */}
      <Link
        href="/"
        onClick={() => setAberto(false)}
        className="mb-4 flex items-center justify-center gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--on-brand)_32%,transparent)] px-4 py-3 text-[0.86rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] dark:border-line dark:text-ink dark:hover:bg-sunken"
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
        Voltar ao site
      </Link>

      <div className="flex items-center gap-3 border-t border-[color-mix(in_srgb,var(--on-brand)_15%,transparent)] pt-4 dark:border-line">
        <Avatar iniciais={iniciais} tamanho={38} dourado />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.86rem] font-semibold text-[var(--on-brand)] dark:text-ink">
            {nome}
          </p>
          <p className="text-[0.72rem] text-vp-gold">Clube Vitapraxis</p>
        </div>
        <form action={sair}>
          <button
            type="submit"
            title="Sair"
            aria-label="Sair da conta"
            className="rounded-lg p-2 text-[color-mix(in_srgb,var(--on-brand)_70%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_10%,transparent)] hover:text-[var(--on-brand)] dark:text-muted dark:hover:bg-sunken dark:hover:text-ink"
          >
            <IconeSair className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior no mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface px-5 py-3 lg:hidden">
        <Logo altura={26} />
        <button
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-line p-2 text-muted"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Drawer no mobile */}
      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAberto(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto bg-vp-green p-6 dark:bg-surface">
            {conteudo}
          </aside>
        </div>
      )}

      {/* Sidebar fixa no desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-vp-green p-6 dark:border-r dark:border-line dark:bg-surface lg:flex">
        {conteudo}
      </aside>
    </>
  );
}
