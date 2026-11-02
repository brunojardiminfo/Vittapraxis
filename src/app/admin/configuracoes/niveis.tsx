"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  salvarNivel,
  excluirNivel,
  type EstadoNivel,
} from "@/app/actions/configuracao";

export type NivelEditavel = {
  id: string;
  nome: string;
  minimo: number;
  beneficio: string;
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.86rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

function Salvar({ novo }: { novo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : novo ? "Criar faixa" : "Salvar"}
    </button>
  );
}

/** Uma faixa: existente quando recebe `nivel`, nova quando não recebe. */
function Faixa({
  nivel,
  ehEntrada,
}: {
  nivel?: NivelEditavel;
  ehEntrada?: boolean;
}) {
  const [estado, formAction] = useActionState<EstadoNivel, FormData>(
    salvarNivel,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [nome, setNome] = useState(nivel?.nome ?? "");
  const [minimo, setMinimo] = useState(String(nivel?.minimo ?? ""));
  const [beneficio, setBeneficio] = useState(nivel?.beneficio ?? "");

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-line bg-surface p-5"
    >
      {nivel ? <input type="hidden" name="id" value={nivel.id} /> : null}

      <div className="grid gap-3.5 sm:grid-cols-[1fr_9rem]">
        <div>
          <label className={ROTULO}>Nome da faixa</label>
          <input
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex.: Platina"
            className={CAMPO}
          />
        </div>

        <div>
          <label className={ROTULO}>A partir de (pts)</label>
          <input
            name="minimo"
            type="number"
            min={0}
            value={minimo}
            onChange={(e) => setMinimo(e.target.value)}
            className={CAMPO}
          />
        </div>
      </div>

      <div className="mt-3.5">
        <label className={ROTULO}>O que essa faixa dá</label>
        <textarea
          name="beneficio"
          rows={2}
          value={beneficio}
          onChange={(e) => setBeneficio(e.target.value)}
          placeholder="ex.: Tudo do Prata mais participação nos sorteios mensais"
          className={`${CAMPO} resize-y`}
        />
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {estado.ok ? (
        <p
          role="status"
          className="mt-3 rounded-lg bg-success-bg px-3.5 py-2 text-[0.82rem] font-medium text-success"
        >
          Salvo.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Salvar novo={!nivel} />

        {nivel && !ehEntrada ? (
          <button
            type="submit"
            formAction={excluirNivel}
            className="rounded-full border border-line px-4 py-2.5 text-[0.8rem] font-semibold transition-colors hover:border-danger hover:text-danger"
          >
            Excluir
          </button>
        ) : null}

        {ehEntrada ? (
          <span className="text-[0.76rem] text-muted">
            Faixa de entrada — não pode ser excluída
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function Niveis({ niveis }: { niveis: NivelEditavel[] }) {
  const [criando, setCriando] = useState(false);
  const entrada = niveis[0]?.id;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.15rem]">Faixas do Clube</h2>
          <p className="mt-1 text-[0.84rem] text-muted">
            O degrau é &ldquo;a partir de&rdquo;. Quem tem menos pontos que a
            segunda faixa fica na primeira.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCriando((v) => !v)}
          className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {criando ? "Fechar" : "Nova faixa"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {niveis.map((n) => (
          <Faixa key={n.id} nivel={n} ehEntrada={n.id === entrada} />
        ))}
        {criando ? <Faixa /> : null}
      </div>
    </section>
  );
}
