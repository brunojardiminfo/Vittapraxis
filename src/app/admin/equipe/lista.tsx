"use client";

import { useState } from "react";
import { alternarProfissional } from "@/app/actions/equipe";
import { Pill, Vazio } from "@/components/ui";
import {
  FormularioProfissional,
  type ProfissionalEditavel,
  type ServicoOpcao,
} from "./formulario";

export type ItemEquipe = ProfissionalEditavel & {
  nomesServicos: string[];
  sessoes: number;
};

/** Equipe cadastrada, com edição dentro do próprio item. */
export function ListaEquipe({
  itens,
  servicos,
  fotos,
}: {
  itens: ItemEquipe[];
  servicos: ServicoOpcao[];
  fotos: string[];
}) {
  const [editando, setEditando] = useState<string | null>(null);

  if (itens.length === 0) {
    return <Vazio>Nenhum profissional cadastrado.</Vazio>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {itens.map((p) => (
        <li
          key={p.id}
          className={`rounded-2xl border bg-surface p-5 ${
            p.ativo ? "border-line" : "border-dashed border-line opacity-70"
          }`}
        >
          {editando === p.id ? (
            <FormularioProfissional
              servicos={servicos}
              fotos={fotos}
              profissional={p}
              aoFechar={() => setEditando(null)}
            />
          ) : (
            <>
              <div className="mb-1.5 flex flex-wrap items-center gap-3">
                <h3 className="font-sans text-[1rem] font-semibold">
                  {p.nome}
                </h3>
                <Pill tom={p.ativo ? "success" : "muted"}>
                  {p.ativo ? "Na equipe" : "Fora"}
                </Pill>
                <span className="text-[0.78rem] text-accent">
                  {p.especialidade}
                </span>
              </div>

              {p.credencial ? (
                <p className="text-[0.82rem] text-muted">{p.credencial}</p>
              ) : null}

              <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
                {p.bio}
              </p>

              <p className="mt-2.5 text-[0.8rem] text-muted">
                {p.nomesServicos.length > 0 ? (
                  <>Atende: {p.nomesServicos.join(" · ")}</>
                ) : (
                  <span className="text-warning">
                    Sem serviço vinculado — não aparece para o paciente escolher
                  </span>
                )}
              </p>

              <p className="mt-1 text-[0.78rem] text-muted">
                {p.sessoes} {p.sessoes === 1 ? "sessão" : "sessões"} no
                histórico · ordem {p.ordem}
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditando(p.id)}
                  className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  Editar
                </button>

                <form action={alternarProfissional}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                  >
                    {p.ativo ? "Tirar da equipe" : "Trazer de volta"}
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
