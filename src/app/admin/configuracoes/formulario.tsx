"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  salvarConfiguracao,
  type EstadoConfig,
} from "@/app/actions/configuracao";

export type Regras = {
  pontosCadastro: number;
  pontosPorSessao: number;
  pontosPorPacote: number;
  cashbackPorIndicacao: number;
  validadeCreditoMeses: number;
  vouchersAniversarioAno: number;
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-6 py-3 text-[0.85rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar regras"}
    </button>
  );
}

export function FormularioConfiguracao({ regras }: { regras: Regras }) {
  const [estado, formAction] = useActionState<EstadoConfig, FormData>(
    salvarConfiguracao,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [cadastro, setCadastro] = useState(String(regras.pontosCadastro));
  const [sessao, setSessao] = useState(String(regras.pontosPorSessao));
  const [pacote, setPacote] = useState(String(regras.pontosPorPacote));
  const [credito, setCredito] = useState(
    String(regras.cashbackPorIndicacao).replace(".", ",")
  );
  const [validade, setValidade] = useState(
    String(regras.validadeCreditoMeses)
  );
  const [vouchers, setVouchers] = useState(
    String(regras.vouchersAniversarioAno)
  );

  const porSessao = Number(sessao) || 0;

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-line bg-surface p-7 sm:p-8"
    >
      <h2 className="mb-1.5 text-[1.15rem]">Pontuação</h2>
      <p className="mb-6 text-[0.84rem] text-muted">
        O que cada ação do paciente vale em pontos.
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="pontosCadastro" className={ROTULO}>
            Cadastro + 1ª sessão
          </label>
          <input
            id="pontosCadastro"
            name="pontosCadastro"
            type="number"
            min={0}
            value={cadastro}
            onChange={(e) => setCadastro(e.target.value)}
            className={CAMPO}
          />
          <p className="mt-1.5 text-[0.76rem] text-muted">Uma única vez</p>
        </div>

        <div>
          <label htmlFor="pontosPorSessao" className={ROTULO}>
            Por sessão
          </label>
          <input
            id="pontosPorSessao"
            name="pontosPorSessao"
            type="number"
            min={0}
            value={sessao}
            onChange={(e) => setSessao(e.target.value)}
            className={CAMPO}
          />
          <p className="mt-1.5 text-[0.76rem] text-muted">
            Padrão; cada serviço pode ter o seu
          </p>
        </div>

        <div>
          <label htmlFor="pontosPorPacote" className={ROTULO}>
            Por pacote
          </label>
          <input
            id="pontosPorPacote"
            name="pontosPorPacote"
            type="number"
            min={0}
            value={pacote}
            onChange={(e) => setPacote(e.target.value)}
            className={CAMPO}
          />
          <p className="mt-1.5 text-[0.76rem] text-muted">Na aquisição</p>
        </div>
      </div>

      <h2 className="mb-1.5 mt-9 text-[1.15rem]">Indicação e vouchers</h2>
      <p className="mb-6 text-[0.84rem] text-muted">
        O crédito sai quando a pessoa indicada conclui a primeira sessão.
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="cashbackPorIndicacao" className={ROTULO}>
            Crédito por indicação (R$)
          </label>
          <input
            id="cashbackPorIndicacao"
            name="cashbackPorIndicacao"
            inputMode="decimal"
            value={credito}
            onChange={(e) => setCredito(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="validadeCreditoMeses" className={ROTULO}>
            Validade do crédito (meses)
          </label>
          <input
            id="validadeCreditoMeses"
            name="validadeCreditoMeses"
            type="number"
            min={1}
            max={120}
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="vouchersAniversarioAno" className={ROTULO}>
            Vouchers de aniversário por ano
          </label>
          <input
            id="vouchersAniversarioAno"
            name="vouchersAniversarioAno"
            type="number"
            min={0}
            max={12}
            value={vouchers}
            onChange={(e) => setVouchers(e.target.value)}
            className={CAMPO}
          />
        </div>
      </div>

      {porSessao > 0 ? (
        <p className="mt-7 rounded-xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
          Com esses números, um paciente que se cadastra e faz a primeira
          sessão já entra com{" "}
          <strong className="font-semibold text-ink">
            {Number(cadastro) || 0} pontos
          </strong>
          . Depois, cada sessão soma {porSessao} — então são{" "}
          <strong className="font-semibold text-ink">
            {Math.max(0, Math.ceil((1000 - (Number(cadastro) || 0)) / porSessao))}{" "}
            sessões
          </strong>{" "}
          para passar dos 1.000 pontos.
        </p>
      ) : null}

      {estado.erro ? (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {estado.ok ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success"
        >
          Salvo. O site e o portal já mostram as novas regras.
        </p>
      ) : null}

      <div className="mt-7">
        <Salvar />
      </div>
    </form>
  );
}
