"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { editarEvolucao, type EstadoEdicaoEvolucao } from "@/app/actions/pro";

const CAMPO =
  "w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.86rem] leading-relaxed outline-none focus:border-accent";
const ROTULO =
  "mb-1 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-4 py-2 text-[0.78rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar"}
    </button>
  );
}

type Evolucao = {
  id: string;
  queixa: string | null;
  conduta: string;
  evolucao: string;
  orientacoes: string | null;
};

/** Corrige o texto de uma evolução própria, ali mesmo no histórico. */
export function EditarEvolucao({ evolucao }: { evolucao: Evolucao }) {
  const [estado, formAction] = useActionState<EstadoEdicaoEvolucao, FormData>(
    editarEvolucao,
    {}
  );
  const [aberto, setAberto] = useState(false);
  const [campos, setCampos] = useState({
    queixa: evolucao.queixa ?? "",
    conduta: evolucao.conduta,
    evolucao: evolucao.evolucao,
    orientacoes: evolucao.orientacoes ?? "",
  });

  useEffect(() => {
    if (estado.ok) setAberto(false);
  }, [estado]);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="self-start text-[0.78rem] font-semibold text-accent hover:underline"
      >
        Editar evolução
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-1 flex flex-col gap-3">
      <input type="hidden" name="id" value={evolucao.id} />
      {(
        [
          ["queixa", "Queixa", 2],
          ["conduta", "Conduta", 3],
          ["evolucao", "Evolução", 3],
          ["orientacoes", "Orientações", 2],
        ] as const
      ).map(([nome, rotulo, linhas]) => (
        <div key={nome}>
          <label htmlFor={`${nome}-${evolucao.id}`} className={ROTULO}>
            {rotulo}
          </label>
          <textarea
            id={`${nome}-${evolucao.id}`}
            name={nome}
            rows={linhas}
            value={campos[nome]}
            onChange={(e) => setCampos((c) => ({ ...c, [nome]: e.target.value }))}
            className={CAMPO}
          />
        </div>
      ))}
      {estado.erro ? (
        <p role="alert" className="text-[0.8rem] text-danger">
          {estado.erro}
        </p>
      ) : null}
      <div className="flex gap-2.5">
        <Salvar />
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-line px-4 py-2 text-[0.78rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
