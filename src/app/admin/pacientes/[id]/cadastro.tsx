"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { editarPaciente, type EstadoEdicao } from "@/app/actions/pacientes";

export type CadastroEditavel = {
  id: string;
  telefone: string | null;
  whatsapp: string | null;
  dataNascimento: string;
  endereco: string | null;
  emergenciaNome: string | null;
  emergenciaFone: string | null;
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.86rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar cadastro"}
    </button>
  );
}

export function FormularioCadastro({
  paciente,
  email,
  codigo,
}: {
  paciente: CadastroEditavel;
  email: string;
  codigo: string;
}) {
  const [estado, formAction] = useActionState<EstadoEdicao, FormData>(
    editarPaciente,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro apagaria o cadastro inteiro já digitado.
  const [telefone, setTelefone] = useState(paciente.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(paciente.whatsapp ?? "");
  const [nascimento, setNascimento] = useState(paciente.dataNascimento);
  const [endereco, setEndereco] = useState(paciente.endereco ?? "");
  const [emNome, setEmNome] = useState(paciente.emergenciaNome ?? "");
  const [emFone, setEmFone] = useState(paciente.emergenciaFone ?? "");

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-line bg-surface p-6"
    >
      <input type="hidden" name="id" value={paciente.id} />

      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-sans text-[1.05rem] font-semibold">Cadastro</h2>
        <span className="text-[0.78rem] text-muted">
          {email} · código {codigo}
        </span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="telefone" className={ROTULO}>
            Telefone
          </label>
          <input
            id="telefone"
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(51) 99999-9999"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className={ROTULO}>
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(51) 99999-9999"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="dataNascimento" className={ROTULO}>
            Nascimento
          </label>
          <input
            id="dataNascimento"
            name="dataNascimento"
            type="date"
            value={nascimento}
            onChange={(e) => setNascimento(e.target.value)}
            className={CAMPO}
          />
          <p className="mt-1.5 text-[0.74rem] text-muted">
            Define o mês do voucher de aniversário
          </p>
        </div>

        <div>
          <label htmlFor="emergenciaFone" className={ROTULO}>
            Telefone de emergência
          </label>
          <input
            id="emergenciaFone"
            name="emergenciaFone"
            value={emFone}
            onChange={(e) => setEmFone(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="emergenciaNome" className={ROTULO}>
            Contato de emergência
          </label>
          <input
            id="emergenciaNome"
            name="emergenciaNome"
            value={emNome}
            onChange={(e) => setEmNome(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="endereco" className={ROTULO}>
            Endereço
          </label>
          <input
            id="endereco"
            name="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
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
          Cadastro atualizado.
        </p>
      ) : null}

      <div className="mt-5">
        <Salvar />
      </div>
    </form>
  );
}
