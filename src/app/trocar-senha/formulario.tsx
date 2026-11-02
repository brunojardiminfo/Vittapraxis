"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { trocarSenha, type EstadoTroca } from "@/app/actions/auth";

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-all hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep dark:hover:bg-vp-gold-pale"
    >
      {pending ? "Salvando…" : "Salvar nova senha"}
    </button>
  );
}

export function FormularioTroca({ provisoria }: { provisoria: boolean }) {
  const [estado, formAction] = useActionState<EstadoTroca, FormData>(
    trocarSenha,
    {}
  );

  // Controlados: o React 19 limpa o formulário a cada erro
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div>
        <label htmlFor="atual" className={ROTULO}>
          {provisoria ? "Senha provisória" : "Senha atual"}
        </label>
        <input
          id="atual"
          name="atual"
          type="password"
          autoComplete="current-password"
          required
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
          className={CAMPO}
        />
      </div>

      <div>
        <label htmlFor="nova" className={ROTULO}>
          Nova senha
        </label>
        <input
          id="nova"
          name="nova"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          className={CAMPO}
        />
        <p className="mt-1.5 text-[0.76rem] text-muted">
          Mínimo de 8 caracteres.
        </p>
      </div>

      <div>
        <label htmlFor="confirmacao" className={ROTULO}>
          Repita a nova senha
        </label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          required
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          className={CAMPO}
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

      <Enviar />
    </form>
  );
}
