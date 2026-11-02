"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { emitirVale, type EstadoEmissao } from "@/app/actions/vale";

export type Opcao = { id: string; nome: string };

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.86rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

/** Daqui a um ano, em AAAA-MM-DD — validade usual de um presente. */
function emUmAno() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function Confirmar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Emitindo…" : "Emitir vale"}
    </button>
  );
}

/**
 * Emissão do vale, fechada até a recepção decidir emitir.
 *
 * O paciente é opcional de propósito: quem ganha um presente quase nunca tem
 * conta ainda, e exigir o vínculo travaria a emissão no balcão.
 */
export function Emissao({
  id,
  pacientes,
  paraNome,
}: {
  id: string;
  pacientes: Opcao[];
  paraNome: string;
}) {
  const [estado, formAction] = useActionState<EstadoEmissao, FormData>(
    emitirVale,
    {}
  );
  const [aberto, setAberto] = useState(false);
  const [validoAte, setValidoAte] = useState(emUmAno());
  const [pacienteId, setPacienteId] = useState("");

  // Emitido: o que importa agora é o código, para ditar a quem comprou
  if (estado.ok && estado.codigo) {
    return (
      <div className="mt-3 w-full rounded-xl bg-success-bg px-4 py-3.5">
        <p className="text-[0.82rem] font-medium text-success">
          Vale emitido. Passe este código a quem comprou:
        </p>
        <p className="mt-1.5 font-serif text-[1.6rem] tracking-[0.12em] text-success">
          {estado.codigo}
        </p>
      </div>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
      >
        Emitir
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 w-full">
      <input type="hidden" name="id" value={id} />

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className={ROTULO}>Vale até</label>
          <input
            name="validoAte"
            type="date"
            value={validoAte}
            onChange={(e) => setValidoAte(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div>
          <label className={ROTULO}>
            {paraNome} já é paciente?{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <select
            name="pacienteId"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            className={CAMPO}
          >
            <option value="">Ainda não tem cadastro</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-2 text-[0.76rem] text-muted">
        Com o paciente escolhido, o vale também aparece no portal dele. Sem
        isso, vale só o código no balcão.
      </p>

      {estado.erro ? (
        <p
          role="alert"
          className="mt-2.5 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="mt-3.5 flex gap-2">
        <Confirmar />
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-line px-4 py-2.5 text-[0.82rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Fechar
        </button>
      </div>
    </form>
  );
}
