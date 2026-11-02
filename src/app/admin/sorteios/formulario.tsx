"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { criarSorteio, type EstadoSorteio } from "@/app/actions/sorteios";

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted";

/** AAAA-MM-DD do primeiro e do último dia do mês corrente. */
function mesCorrente() {
  const d = new Date();
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return {
    inicio: iso(new Date(d.getFullYear(), d.getMonth(), 1)),
    fim: iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
    nome: new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(d),
  };
}

function Criar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-6 py-3 text-[0.85rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Criando…" : "Criar sorteio"}
    </button>
  );
}

export function FormularioSorteio({ niveis }: { niveis: string[] }) {
  const [estado, formAction] = useActionState<EstadoSorteio, FormData>(
    criarSorteio,
    {}
  );

  const mes = mesCorrente();

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [titulo, setTitulo] = useState(
    `Sorteio de ${mes.nome[0].toUpperCase()}${mes.nome.slice(1)}`
  );
  const [premio, setPremio] = useState("");
  const [nivel, setNivel] = useState("");
  const [inicio, setInicio] = useState(mes.inicio);
  const [fim, setFim] = useState(mes.fim);

  useEffect(() => {
    if (estado.ok) setPremio("");
  }, [estado.ok]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-line bg-surface p-7"
    >
      <h2 className="mb-1.5 text-[1.15rem]">Novo sorteio</h2>
      <p className="mb-6 text-[0.84rem] leading-relaxed text-muted">
        Concorre quem concluiu ao menos uma sessão dentro do período. Estar no
        Clube não basta — a ideia é premiar quem se tratou no mês.
      </p>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="titulo" className={ROTULO}>
            Nome
          </label>
          <input
            id="titulo"
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="premio" className={ROTULO}>
            Prêmio
          </label>
          <input
            id="premio"
            name="premio"
            value={premio}
            onChange={(e) => setPremio(e.target.value)}
            placeholder="ex.: Uma sessão de quiropraxia"
            className={CAMPO}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="inicioEm" className={ROTULO}>
              De
            </label>
            <input
              id="inicioEm"
              name="inicioEm"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor="fimEm" className={ROTULO}>
              Até
            </label>
            <input
              id="fimEm"
              name="fimEm"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor="nivelMinimo" className={ROTULO}>
              Faixa mínima
            </label>
            <select
              id="nivelMinimo"
              name="nivelMinimo"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className={CAMPO}
            >
              <option value="">Todo o Clube</option>
              {niveis.map((n) => (
                <option key={n} value={n}>
                  {n} ou acima
                </option>
              ))}
            </select>
          </div>
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
            Sorteio criado. Apure quando o período fechar.
          </p>
        ) : null}

        <Criar />
      </div>
    </form>
  );
}
