"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  criarPaciente,
  type EstadoNovoPaciente,
} from "@/app/actions/pacientes";
import { IconeCheck } from "@/components/icones";

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
      className="inline-flex items-center justify-center rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Cadastrando…" : "Cadastrar paciente"}
    </button>
  );
}

export function FormularioNovoPaciente() {
  const [estado, formAction] = useActionState<EstadoNovoPaciente, FormData>(
    criarPaciente,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro de validação apagaria o cadastro inteiro já digitado.
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [senha, setSenha] = useState("");
  const [indicadoPor, setIndicadoPor] = useState("");

  if (estado.ok && estado.criado) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-9 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <IconeCheck className="h-6 w-6 text-success" />
        </span>
        <h2 className="mb-2 text-[1.4rem]">Paciente cadastrado</h2>
        <p className="text-[0.92rem] text-muted">
          {estado.criado.nome} já pode entrar no portal com{" "}
          <strong className="font-semibold text-ink">
            {estado.criado.email}
          </strong>{" "}
          e a senha que você definiu.
        </p>
        <p className="mt-4 inline-block rounded-xl bg-sunken px-5 py-3 text-[0.88rem]">
          Código de indicação:{" "}
          <strong className="font-semibold tracking-wider text-accent">
            {estado.criado.codigo}
          </strong>
        </p>
        <p className="mx-auto mt-4 max-w-md text-[0.82rem] leading-relaxed text-muted">
          Peça para trocar a senha no primeiro acesso, em Meu Perfil.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/admin/pacientes"
            className="rounded-full bg-vp-green px-6 py-3 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
          >
            Ver pacientes
          </Link>
          <Link
            href="/admin/pacientes/novo"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            Cadastrar outro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-line bg-surface p-7 sm:p-9"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nome" className={ROTULO}>
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor="email" className={ROTULO}>
              E-mail (será o login)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor="senha" className={ROTULO}>
              Senha inicial
            </label>
            <input
              id="senha"
              name="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
              className={CAMPO}
            />
          </div>

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
          </div>

          <div>
            <label htmlFor="indicadoPor" className={ROTULO}>
              Código de quem indicou{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </label>
            <input
              id="indicadoPor"
              name="indicadoPor"
              value={indicadoPor}
              onChange={(e) => setIndicadoPor(e.target.value)}
              placeholder="ex.: SOFIA-VP26"
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

        <p className="rounded-xl bg-sunken px-4 py-3 text-[0.82rem] leading-relaxed text-muted">
          Com o código de quem indicou preenchido, o cashback da indicação é
          liberado sozinho assim que esta pessoa fizer a primeira sessão.
        </p>

        {estado.erro ? (
          <p
            role="alert"
            className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
          >
            {estado.erro}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Salvar />
          <Link
            href="/admin/pacientes"
            className="rounded-full border border-line px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
