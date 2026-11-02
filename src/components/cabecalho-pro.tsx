"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Logo } from "@/components/ui";
import { IconeSair } from "@/components/icones";

const LINKS = [
  ["/pro", "Início"],
  ["/pro/pacientes", "Pacientes"],
  ["/pro/atendimentos", "Meus atendimentos"],
] as const;

function ativo(caminho: string, href: string) {
  return href === "/pro" ? caminho === "/pro" : caminho.startsWith(href);
}

/** Cabeçalho do Portal do Profissional: três destinos, cabe em qualquer tela. */
export function CabecalhoPro({
  nome,
  especialidade,
  iniciais,
  sair,
}: {
  nome: string;
  especialidade: string;
  iniciais: string;
  sair: () => Promise<void>;
}) {
  const caminho = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-vp-green text-[var(--on-brand)] dark:bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-3.5 lg:px-8">
        <Link href="/pro" className="flex items-center gap-3.5">
          <Logo altura={28} emFundoEscuro />
          <span className="hidden sm:block">
            <span className="block font-serif text-[1rem] leading-tight">
              Portal do Profissional
            </span>
            <span className="block text-[0.72rem] text-vp-gold">
              Clínica Vitapraxis
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/trocar-senha" title="Trocar senha" className="hidden text-right sm:block">
            <span className="block text-[0.86rem] font-semibold">{nome}</span>
            <span className="block text-[0.72rem] text-vp-gold">
              {especialidade}
            </span>
          </Link>
          <Avatar iniciais={iniciais} tamanho={34} dourado />
          <form action={sair}>
            <button
              type="submit"
              title="Sair"
              aria-label="Sair da conta"
              className="rounded-lg p-2 text-[color-mix(in_srgb,var(--on-brand)_70%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] hover:text-[var(--on-brand)]"
            >
              <IconeSair className="h-4 w-4" />
            </button>
          </form>
        </div>

        <nav className="flex w-full gap-2 overflow-x-auto md:w-auto md:order-none">
          {LINKS.map(([href, texto]) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full border px-4 py-2 text-[0.8rem] font-semibold transition-colors ${
                ativo(caminho, href)
                  ? "border-vp-gold bg-[color-mix(in_srgb,var(--color-vp-gold)_18%,transparent)] text-vp-gold"
                  : "border-[color-mix(in_srgb,var(--on-brand)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] dark:border-line"
              }`}
            >
              {texto}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
