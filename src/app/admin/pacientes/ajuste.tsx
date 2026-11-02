"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ajustarClube, type EstadoAjuste } from "@/app/actions/pacientes";

function Aplicar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Lançando…" : "Lançar"}
    </button>
  );
}

/**
 * Fechado por padrão: a lista precisa continuar escaneável, e um formulário
 * aberto em cada paciente viraria uma parede de campos.
 */
export function AjusteClube({
  id,
  nome,
  pontos,
  cashback,
}: {
  id: string;
  nome: string;
  pontos: number;
  cashback: number;
}) {
  const [estado, formAction] = useActionState<EstadoAjuste, FormData>(
    ajustarClube,
    {}
  );
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<"PONTOS" | "CASHBACK">("PONTOS");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        Ajustar Clube
      </button>
    );
  }

  const saldo = tipo === "PONTOS" ? pontos : cashback;

  return (
    <form
      action={formAction}
      className="mt-3 w-full rounded-xl border border-line bg-sunken p-4"
    >
      <input type="hidden" name="id" value={id} />

      <p className="mb-3 text-[0.78rem] text-muted">
        Ajuste manual para <strong className="text-ink">{nome}</strong>. Use
        número negativo para debitar. Fica registrado com seu nome.
      </p>

      <div className="flex flex-wrap gap-2.5">
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "PONTOS" | "CASHBACK")}
          className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.85rem] outline-none focus:border-accent"
        >
          <option value="PONTOS">Pontos</option>
          <option value="CASHBACK">Cashback (R$)</option>
        </select>

        <input
          name="valor"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={tipo === "PONTOS" ? "ex.: 50 ou -20" : "ex.: 50 ou -20"}
          className="w-36 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.85rem] outline-none focus:border-accent"
        />

        <input
          name="motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo — ex.: cortesia de aniversário"
          className="min-w-[14rem] flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.85rem] outline-none focus:border-accent"
        />
      </div>

      <p className="mt-2 text-[0.76rem] text-muted">
        Saldo atual:{" "}
        {tipo === "PONTOS"
          ? `${saldo.toLocaleString("pt-BR")} pontos`
          : saldo.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
      </p>

      {estado.erro ? (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {estado.ok ? (
        <p
          role="status"
          className="mt-2 rounded-lg bg-success-bg px-3.5 py-2 text-[0.82rem] font-medium text-success"
        >
          Lançado. O saldo do paciente já mudou.
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Aplicar />
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-line px-4 py-2.5 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Fechar
        </button>
      </div>
    </form>
  );
}
