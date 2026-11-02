"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { enviarFeedback, type EstadoFeedback } from "@/app/actions/feedback";

const TIPOS = [
  ["ELOGIO", "Elogio", "algo que funcionou bem"],
  ["SUGESTAO", "Sugestão", "uma ideia para melhorar"],
  ["RECLAMACAO", "Reclamação", "algo que deu errado"],
] as const;

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Enviando…" : "Enviar"}
    </button>
  );
}

export function FormularioFeedback() {
  const [estado, formAction] = useActionState<EstadoFeedback, FormData>(
    enviarFeedback,
    {}
  );

  // Controlados porque o React 19 limpa campos não-controlados depois que a
  // action roda — num erro de validação o texto todo se perderia.
  const [tipo, setTipo] = useState<string>("SUGESTAO");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Aqui a limpeza é desejada: enviou, o campo esvazia para a próxima
  useEffect(() => {
    if (estado.ok) {
      setAssunto("");
      setMensagem("");
      setTipo("SUGESTAO");
    }
  }, [estado.ok]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          O que você quer nos contar?
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {TIPOS.map(([valor, titulo, ajuda]) => (
            <label
              key={valor}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                tipo === valor
                  ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                  : "border-line bg-surface hover:border-accent"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={valor}
                checked={tipo === valor}
                onChange={() => setTipo(valor)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-[0.9rem] font-semibold">
                  {titulo}
                </span>
                <span className="block text-[0.76rem] text-muted">{ajuda}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="assunto"
          className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Assunto
        </label>
        <input
          id="assunto"
          name="assunto"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          maxLength={120}
          placeholder="Ex.: tempo de espera na recepção"
          className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
        />
      </div>

      <div>
        <label
          htmlFor="mensagem"
          className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Conte o que aconteceu
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Quanto mais concreto, mais fácil resolver."
          className="w-full resize-y rounded-xl border border-line bg-sunken p-4 text-[0.9rem] outline-none focus:border-accent"
        />
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {estado.ok ? (
        <p
          role="status"
          className="rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success"
        >
          Recebemos sua mensagem. A resposta aparece aqui embaixo, no
          histórico.
        </p>
      ) : null}

      <Enviar />
    </form>
  );
}
