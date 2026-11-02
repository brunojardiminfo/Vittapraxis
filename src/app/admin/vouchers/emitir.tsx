"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  emitirVoucherManual,
  type EstadoManual,
} from "@/app/actions/vouchers";

export type Opcao = { id: string; nome: string };

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.86rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

/** Daqui a trinta dias, em AAAA-MM-DD — validade padrão de uma cortesia. */
function emTrintaDias() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function Emitir() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Emitindo…" : "Emitir voucher"}
    </button>
  );
}

/**
 * Emissão avulsa, fechada por padrão.
 *
 * O caminho comum é a regra conceder sozinha; isto aqui cobre o pedido de
 * balcão, então não precisa ocupar a tela o tempo todo.
 */
export function EmitirVoucher({
  pacientes,
  servicos,
  faixas,
}: {
  pacientes: Opcao[];
  servicos: Opcao[];
  /** Faixas do Clube, para disparar uma campanha só para elas */
  faixas: string[];
}) {
  const [estado, formAction] = useActionState<EstadoManual, FormData>(
    emitirVoucherManual,
    {}
  );
  const [aberto, setAberto] = useState(false);

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [pacienteId, setPacienteId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [forma, setForma] = useState<"VALOR" | "PERCENTUAL">("VALOR");
  const [valor, setValor] = useState("");
  const [percentual, setPercentual] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [validoAte, setValidoAte] = useState(emTrintaDias());

  useEffect(() => {
    if (estado.ok) {
      setTitulo("");
      setDescricao("");
      setValor("");
      setPercentual("");
    }
  }, [estado.ok]);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        Emitir voucher
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-7 rounded-3xl border border-line bg-surface p-7"
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[1.15rem]">Emitir voucher</h2>
          <p className="mt-1 text-[0.84rem] text-muted">
            Para um paciente ou como campanha para a base toda ou uma faixa
            do Clube. Depois, avise cada um pelo botão de WhatsApp da lista.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-[0.84rem] font-semibold text-muted hover:text-accent"
        >
          Fechar
        </button>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="pacienteId" className={ROTULO}>
            Para quem
          </label>
          <select
            id="pacienteId"
            name="pacienteId"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            className={CAMPO}
          >
            <option value="">Escolha…</option>
            <optgroup label="Campanha">
              <option value="TODOS">
                Todos os pacientes ({pacientes.length})
              </option>
              {faixas.map((f) => (
                <option key={f} value={`FAIXA:${f}`}>
                  Faixa {f}
                </option>
              ))}
            </optgroup>
            <optgroup label="Paciente">
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label htmlFor="titulo" className={ROTULO}>
            Nome do voucher
          </label>
          <input
            id="titulo"
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="ex.: Cortesia de retorno"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="forma" className={ROTULO}>
            Tipo de benefício
          </label>
          <select
            id="forma"
            name="forma"
            value={forma}
            onChange={(e) => setForma(e.target.value as "VALOR" | "PERCENTUAL")}
            className={CAMPO}
          >
            <option value="VALOR">Crédito em reais</option>
            <option value="PERCENTUAL">Desconto em %</option>
          </select>
        </div>

        {forma === "VALOR" ? (
          <div>
            <label htmlFor="valor" className={ROTULO}>
              Valor (R$)
            </label>
            <input
              id="valor"
              name="valor"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="50"
              className={CAMPO}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="percentual" className={ROTULO}>
              Desconto (%)
            </label>
            <input
              id="percentual"
              name="percentual"
              type="number"
              min={1}
              max={100}
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              placeholder="30"
              className={CAMPO}
            />
          </div>
        )}

        <div>
          <label htmlFor="servicoId" className={ROTULO}>
            Serviço{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <select
            id="servicoId"
            name="servicoId"
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
            className={CAMPO}
          >
            <option value="">Qualquer serviço participante</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="validoAte" className={ROTULO}>
            Vale até
          </label>
          <input
            id="validoAte"
            name="validoAte"
            type="date"
            value={validoAte}
            onChange={(e) => setValidoAte(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="descricao" className={ROTULO}>
            Observação{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <input
            id="descricao"
            name="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Combinado no balcão em 12/03"
            className={CAMPO}
          />
        </div>
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="mt-3.5 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {estado.ok ? (
        <p
          role="status"
          className="mt-3.5 rounded-lg bg-success-bg px-3.5 py-2 text-[0.82rem] font-medium text-success"
        >
          {estado.emitidos && estado.emitidos > 1
            ? `${estado.emitidos} vouchers emitidos. Já aparecem no portal de cada paciente.`
            : "Voucher emitido. Já aparece no portal do paciente."}
        </p>
      ) : null}

      <div className="mt-5">
        <Emitir />
      </div>
    </form>
  );
}
