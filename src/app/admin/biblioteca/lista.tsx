"use client";

import { useState } from "react";
import { excluirConteudo } from "@/app/actions/conteudos";
import { ROTULO_CONTEUDO } from "@/lib/conteudo";
import { Pill, Vazio } from "@/components/ui";
import { FormularioConteudo, type ConteudoEditavel } from "./formulario";

export type ItemBiblioteca = ConteudoEditavel & { publicadoEm: string };

/**
 * Lista do que está no ar, com edição no lugar.
 *
 * Abrir o formulário dentro do próprio item evita tirar a pessoa da lista para
 * corrigir uma vírgula — e só um fica aberto por vez, senão a tela vira uma
 * pilha de campos.
 */
export function ListaBiblioteca({ itens }: { itens: ItemBiblioteca[] }) {
  const [editando, setEditando] = useState<string | null>(null);

  if (itens.length === 0) return <Vazio>Nada publicado ainda.</Vazio>;

  return (
    <ul className="flex flex-col gap-3">
      {itens.map((c) => (
        <li
          key={c.id}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          {editando === c.id ? (
            <FormularioConteudo
              conteudo={c}
              aoFechar={() => setEditando(null)}
            />
          ) : (
            <>
              <div className="mb-1.5 flex flex-wrap items-center gap-3">
                <h3 className="font-sans text-[0.98rem] font-semibold">
                  {c.titulo}
                </h3>
                <Pill tom="muted">{ROTULO_CONTEUDO[c.tipo] ?? c.tipo}</Pill>
              </div>

              <p className="text-[0.82rem] text-muted">
                {c.categoria} · {c.publicadoEm}
              </p>

              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                {c.resumo}
              </p>

              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block truncate text-[0.8rem] text-accent hover:underline"
                >
                  {c.url}
                </a>
              ) : null}

              <div className="mt-3.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditando(c.id)}
                  className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  Editar
                </button>

                <form action={excluirConteudo}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-danger hover:text-danger"
                  >
                    Tirar do ar
                  </button>
                </form>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
