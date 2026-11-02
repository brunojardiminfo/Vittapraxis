"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registrarSessao, type EstadoSessao } from "@/app/actions/sessoes";

export type ServicoOpcao = {
  id: string;
  nome: string;
  duracaoMin: number;
  profissionais: { id: string; nome: string }[];
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-2.5 text-[0.9rem] outline-none focus:border-accent";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Registrando…" : "Registrar sessão"}
    </button>
  );
}

export function FormularioSessao({
  servicos,
  servicoInicial,
}: {
  servicos: ServicoOpcao[];
  servicoInicial?: string;
}) {
  const [estado, formAction] = useActionState<EstadoSessao, FormData>(
    registrarSessao,
    {}
  );

  const [servicoId, setServicoId] = useState(
    servicoInicial && servicos.some((s) => s.id === servicoInicial)
      ? servicoInicial
      : (servicos[0]?.id ?? "")
  );
  const [profissionalId, setProfissionalId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const servico = servicos.find((s) => s.id === servicoId);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="servicoId"
          className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
        >
          Serviço
        </label>
        <select
          id="servicoId"
          name="servicoId"
          value={servicoId}
          onChange={(e) => {
            setServicoId(e.target.value);
            setProfissionalId("");
          }}
          className={CAMPO}
        >
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="profissionalId"
          className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
        >
          Profissional
        </label>
        <select
          id="profissionalId"
          name="profissionalId"
          value={profissionalId}
          onChange={(e) => setProfissionalId(e.target.value)}
          required
          className={CAMPO}
        >
          <option value="" disabled>
            Quem vai te atender
          </option>
          {servico?.profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="data"
            className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
          >
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            min={hoje}
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className={CAMPO}
          />
        </div>
        <div>
          <label
            htmlFor="hora"
            className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
          >
            Horário
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            className={CAMPO}
          />
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
        <p className="rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success">
          Sessão registrada! Ela já aparece em Meus Agendamentos.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Enviar />
        <Link
          href="/app/agendamentos"
          className="rounded-full border border-line px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {estado.ok ? "Ver agendamentos" : "Cancelar"}
        </Link>
      </div>
    </form>
  );
}
