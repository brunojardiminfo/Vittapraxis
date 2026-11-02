"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  salvarProfissional,
  type EstadoProfissional,
} from "@/app/actions/equipe";

export type ServicoOpcao = { id: string; nome: string };

export type ProfissionalEditavel = {
  id: string;
  nome: string;
  especialidade: string;
  bio: string;
  credencial: string | null;
  foto: string | null;
  ordem: number;
  ativo: boolean;
  servicos: string[];
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.88rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

function Salvar({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : editando ? "Salvar alterações" : "Adicionar"}
    </button>
  );
}

export function FormularioProfissional({
  servicos,
  fotos,
  profissional,
  aoFechar,
}: {
  servicos: ServicoOpcao[];
  fotos: string[];
  profissional?: ProfissionalEditavel;
  aoFechar?: () => void;
}) {
  const [estado, formAction] = useActionState<EstadoProfissional, FormData>(
    salvarProfissional,
    {}
  );

  const editando = !!profissional;
  const sufixo = profissional?.id ?? "novo";

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [nome, setNome] = useState(profissional?.nome ?? "");
  const [especialidade, setEspecialidade] = useState(
    profissional?.especialidade ?? ""
  );
  const [bio, setBio] = useState(profissional?.bio ?? "");
  const [credencial, setCredencial] = useState(profissional?.credencial ?? "");
  const [foto, setFoto] = useState(profissional?.foto ?? "");
  const [ordem, setOrdem] = useState(String(profissional?.ordem ?? 0));
  const [ativo, setAtivo] = useState(profissional?.ativo ?? true);
  const [marcados, setMarcados] = useState<string[]>(
    profissional?.servicos ?? []
  );

  useEffect(() => {
    if (estado.ok && !editando) {
      setNome("");
      setEspecialidade("");
      setBio("");
      setCredencial("");
      setFoto("");
      setMarcados([]);
    }
  }, [estado.ok, editando]);

  function alternar(id: string) {
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id]
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-line bg-surface p-6"
    >
      {profissional ? (
        <input type="hidden" name="id" value={profissional.id} />
      ) : null}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-sans text-[1.05rem] font-semibold">
          {editando ? "Editar profissional" : "Novo profissional"}
        </h2>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[0.8rem] font-semibold">
            <input
              type="checkbox"
              name="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            {ativo ? "Na equipe" : "Fora da equipe"}
          </label>

          {aoFechar ? (
            <button
              type="button"
              onClick={aoFechar}
              className="text-[0.84rem] font-semibold text-muted hover:text-accent"
            >
              Fechar
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor={`nome-${sufixo}`} className={ROTULO}>
            Nome
          </label>
          <input
            id={`nome-${sufixo}`}
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor={`especialidade-${sufixo}`} className={ROTULO}>
            Especialidade
          </label>
          <input
            id={`especialidade-${sufixo}`}
            name="especialidade"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            placeholder="ex.: Quiropraxia"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor={`credencial-${sufixo}`} className={ROTULO}>
            Credencial{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <input
            id={`credencial-${sufixo}`}
            name="credencial"
            value={credencial}
            onChange={(e) => setCredencial(e.target.value)}
            placeholder="ex.: 20 anos de experiência"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor={`ordem-${sufixo}`} className={ROTULO}>
            Ordem na listagem
          </label>
          <input
            id={`ordem-${sufixo}`}
            name="ordem"
            type="number"
            min={0}
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`foto-${sufixo}`} className={ROTULO}>
            Foto{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional — sem foto usa as iniciais)
            </span>
          </label>
          <select
            id={`foto-${sufixo}`}
            name="foto"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            className={CAMPO}
          >
            <option value="">Sem foto</option>
            {fotos.map((f) => (
              <option key={f} value={f}>
                {f.split("/").pop()}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`bio-${sufixo}`} className={ROTULO}>
            Apresentação
          </label>
          <textarea
            id={`bio-${sufixo}`}
            name="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${CAMPO} resize-y`}
          />
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={ROTULO}>Atende quais serviços</legend>
        <div className="flex flex-wrap gap-2">
          {servicos.map((s) => (
            <label
              key={s.id}
              className={`cursor-pointer rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                marcados.includes(s.id)
                  ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_16%,transparent)] text-accent"
                  : "border-line text-muted hover:border-accent"
              }`}
            >
              <input
                type="checkbox"
                name="servicos"
                value={s.id}
                checked={marcados.includes(s.id)}
                onChange={() => alternar(s.id)}
                className="sr-only"
              />
              {s.nome}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[0.76rem] text-muted">
          É o que define quem aparece quando o paciente escolhe um serviço.
        </p>
      </fieldset>

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
          {editando ? "Alterações salvas." : "Profissional adicionado."}
        </p>
      ) : null}

      <div className="mt-5">
        <Salvar editando={editando} />
      </div>
    </form>
  );
}
