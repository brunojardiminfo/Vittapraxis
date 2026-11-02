"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { entrar, type EstadoLogin } from "@/app/actions/auth";

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-all hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep dark:hover:bg-vp-gold-pale"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent";

export function FormularioLogin({ proximo }: { proximo?: string }) {
  const [estado, formAction] = useActionState<EstadoLogin, FormData>(entrar, {});

  // Controlados porque o React 19 limparia o formulário a cada erro de login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      {proximo ? <input type="hidden" name="proximo" value={proximo} /> : null}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={CAMPO}
        />
      </div>

      <div>
        <label
          htmlFor="senha"
          className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
        >
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
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

      <BotaoEnviar />
    </form>
  );
}
