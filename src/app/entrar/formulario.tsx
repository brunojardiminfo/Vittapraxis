"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { entrar, type EstadoLogin } from "@/app/actions/auth";

const DEMO = [
  {
    papel: "Paciente",
    descricao: "Sofia Garcia",
    email: "sofia@exemplo.com",
  },
  {
    papel: "Administração",
    descricao: "Visão geral da clínica",
    email: "admin@vitapraxis.com.br",
  },
] as const;

const SENHA_DEMO = "vitapraxis";

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

  // Controlados para os atalhos de demonstração poderem preencher os campos —
  // e porque o React 19 limparia o formulário a cada erro de login.
  const [email, setEmail] = useState<string>(DEMO[0].email);
  const [senha, setSenha] = useState<string>(SENHA_DEMO);

  return (
    <>
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

      <section className="mt-9 rounded-2xl border border-line bg-sunken p-5">
        <h2 className="mb-1 font-sans text-[0.82rem] font-semibold">
          Entrar como
        </h2>
        <p className="mb-4 text-[0.78rem] text-muted">
          Quatro perfis de demonstração. Clique para preencher o acesso.
        </p>

        <ul className="grid gap-2 sm:grid-cols-2">
          {DEMO.map((c) => {
            const ativo = email === c.email;
            return (
              <li key={c.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(c.email);
                    setSenha(SENHA_DEMO);
                  }}
                  aria-pressed={ativo}
                  className={`w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    ativo
                      ? "border-accent bg-surface"
                      : "border-line bg-surface hover:border-accent"
                  }`}
                >
                  <span
                    className={`block text-[0.84rem] font-semibold ${
                      ativo ? "text-accent" : ""
                    }`}
                  >
                    {c.papel}
                  </span>
                  <span className="block text-[0.74rem] text-muted">
                    {c.descricao}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[0.76rem] text-muted">
          Senha em todos:{" "}
          <span className="font-semibold tracking-wider text-accent">
            {SENHA_DEMO}
          </span>
        </p>
      </section>
    </>
  );
}
