"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { salvarFicha, type EstadoFicha } from "@/app/actions/pro";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar ficha"}
    </button>
  );
}

/**
 * Ficha clínica: lida antes de atender, editada quando algo muda.
 *
 * Abre em modo leitura para que ninguém altere sem querer ao rolar a tela.
 */
export function FichaClinica({
  pacienteId,
  texto,
}: {
  pacienteId: string;
  texto: string;
}) {
  const [estado, formAction] = useActionState<EstadoFicha, FormData>(
    salvarFicha,
    {}
  );
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(texto);

  useEffect(() => {
    if (estado.ok) setEditando(false);
  }, [estado]);

  if (!editando) {
    return (
      <div>
        {valor ? (
          <p className="whitespace-pre-line text-[0.9rem] leading-relaxed">
            {valor}
          </p>
        ) : (
          <p className="text-[0.86rem] text-muted">
            Ficha em branco. Registre a queixa principal, o objetivo do
            tratamento, contraindicações e cuidados.
          </p>
        )}
        {estado.ok ? (
          <p role="status" className="mt-3 text-[0.8rem] text-success">
            Ficha salva.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="mt-4 rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {valor ? "Editar ficha" : "Preencher ficha"}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="pacienteId" value={pacienteId} />
      <textarea
        name="fichaClinica"
        rows={9}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={
          "Queixa principal:\nObjetivo do tratamento:\nHistórico relevante / cirurgias:\nMedicamentos:\nContraindicações e cuidados:"
        }
        className="w-full resize-y rounded-xl border border-line bg-sunken px-4 py-3 text-[0.88rem] leading-relaxed outline-none focus:border-accent"
      />
      {estado.erro ? (
        <p role="alert" className="mt-2 text-[0.82rem] text-danger">
          {estado.erro}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2.5">
        <Salvar />
        <button
          type="button"
          onClick={() => {
            setValor(texto);
            setEditando(false);
          }}
          className="rounded-full border border-line px-5 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
