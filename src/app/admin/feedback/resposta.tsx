"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { responderFeedback, type EstadoResposta } from "@/app/actions/feedback";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Enviando…" : "Responder"}
    </button>
  );
}

/**
 * Fica fechado por padrão: a lista precisa ser escaneável, e uma caixa de
 * texto aberta em cada item viraria uma parede de formulários.
 */
export function Resposta({ id }: { id: string }) {
  const [estado, formAction] = useActionState<EstadoResposta, FormData>(
    responderFeedback,
    {}
  );
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        Responder
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 w-full">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="resposta"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        maxLength={2000}
        autoFocus
        placeholder="A resposta aparece para o paciente na área dele."
        className="w-full resize-y rounded-xl border border-line bg-sunken p-3.5 text-[0.88rem] outline-none focus:border-accent"
      />

      {estado.erro ? (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="mt-2.5 flex gap-2">
        <Enviar />
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
