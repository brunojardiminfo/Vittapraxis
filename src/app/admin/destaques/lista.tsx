"use client";

import { useState } from "react";
import { alternarDestaque, excluirDestaque } from "@/app/actions/destaques";
import { Pill, Vazio } from "@/components/ui";
import {
  FormularioDestaque,
  type DestaqueEditavel,
} from "./formulario";
import type { ImagemEnviada } from "./seletor-imagem";

export type ItemDestaque = DestaqueEditavel & {
  ativo: boolean;
  situacao: "No ar" | "Desligado" | "Vencido" | "Agendado";
  periodo: string;
};

const TOM: Record<ItemDestaque["situacao"], "success" | "muted"> = {
  "No ar": "success",
  Desligado: "muted",
  Vencido: "muted",
  Agendado: "muted",
};

/**
 * Cartões criados, com edição no lugar.
 *
 * Abrir o formulário dentro do próprio item evita tirar a pessoa da lista
 * para corrigir um texto, e só um fica aberto por vez.
 */
export function ListaDestaques({
  itens,
  imagens,
  enviadas,
}: {
  itens: ItemDestaque[];
  imagens: string[];
  enviadas: ImagemEnviada[];
}) {
  const [editando, setEditando] = useState<string | null>(null);

  if (itens.length === 0) return <Vazio>Nenhum cartão criado ainda.</Vazio>;

  return (
    <ul className="flex flex-col gap-3">
      {itens.map((d) => (
        <li
          key={d.id}
          className={`rounded-2xl border bg-surface p-5 ${
            d.situacao === "No ar" ? "border-line" : "border-dashed border-line"
          }`}
        >
          {editando === d.id ? (
            <FormularioDestaque
              imagens={imagens}
              enviadas={enviadas}
              destaque={d}
              aoFechar={() => setEditando(null)}
            />
          ) : (
            <>
              <div className="mb-1.5 flex flex-wrap items-center gap-3">
                <h3 className="font-sans text-[0.98rem] font-semibold">
                  {d.titulo}
                </h3>
                <Pill tom={TOM[d.situacao]}>{d.situacao}</Pill>
                {d.etiqueta ? (
                  <span className="text-[0.76rem] text-accent">
                    {d.etiqueta}
                  </span>
                ) : null}
              </div>

              <p className="text-[0.86rem] leading-relaxed text-muted">
                {d.texto}
              </p>

              <p className="mt-2 text-[0.78rem] text-muted">
                Ordem {d.ordem}
                {d.periodo}
                {d.link ? ` · ${d.link}` : ""}
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditando(d.id)}
                  className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  Editar
                </button>

                <form action={alternarDestaque}>
                  <input type="hidden" name="id" value={d.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                  >
                    {d.ativo ? "Desligar" : "Ligar"}
                  </button>
                </form>

                <form action={excluirDestaque}>
                  <input type="hidden" name="id" value={d.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-danger hover:text-danger"
                  >
                    Excluir
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
