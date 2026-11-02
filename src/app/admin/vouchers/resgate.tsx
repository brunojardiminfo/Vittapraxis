"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { usarVoucher, type EstadoResgate } from "@/app/actions/vouchers";

function Confirmar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Registrando…" : "Confirmar uso"}
    </button>
  );
}

/**
 * Registro de uso no balcão.
 *
 * Fechado por padrão: a lista precisa continuar escaneável, e um campo de
 * observação aberto em cada voucher viraria uma parede de formulários.
 */
export function Resgate({ id, temValor }: { id: string; temValor: boolean }) {
  const [estado, formAction] = useActionState<EstadoResgate, FormData>(
    usarVoucher,
    {}
  );
  const [aberto, setAberto] = useState(false);
  const [obs, setObs] = useState("");

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        Registrar uso
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 w-full">
      <input type="hidden" name="id" value={id} />

      <input
        name="observacao"
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        maxLength={200}
        placeholder="Onde foi usado — ex.: abatido na sessão de 12/03"
        className="w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.85rem] outline-none focus:border-accent"
      />

      {temValor ? (
        <p className="mt-2 text-[0.76rem] text-muted">
          Confirmar debita o valor do saldo do paciente e registra no extrato.
        </p>
      ) : null}

      {estado.erro ? (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Confirmar />
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
