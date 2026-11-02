"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  excluirMensagem,
  salvarMensagem,
  type EstadoMensagem,
} from "@/app/actions/mensagens";
import { Copiar } from "./copiar";

export type MensagemEditavel = {
  id: string;
  titulo: string;
  para: string | null;
  /** Como foi escrita, com as chaves */
  texto: string;
  /** Com as chaves já trocadas pelos valores do Clube */
  pronto: string;
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
      className="rounded-full bg-vp-green px-5 py-2 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar"}
    </button>
  );
}

/** Formulário de criar ou editar, usado no cartão e no "Nova mensagem". */
export function FormularioMensagem({
  mensagem,
  aoFechar,
}: {
  mensagem?: MensagemEditavel;
  aoFechar: () => void;
}) {
  const [estado, formAction] = useActionState<EstadoMensagem, FormData>(
    salvarMensagem,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [titulo, setTitulo] = useState(mensagem?.titulo ?? "");
  const [para, setPara] = useState(mensagem?.para ?? "");
  const [texto, setTexto] = useState(mensagem?.texto ?? "");

  useEffect(() => {
    if (estado.ok) aoFechar();
  }, [estado.ok, aoFechar]);

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      {mensagem ? <input type="hidden" name="id" value={mensagem.id} /> : null}

      <div>
        <label htmlFor={`t-${mensagem?.id ?? "nova"}`} className={ROTULO}>
          Título
        </label>
        <input
          id={`t-${mensagem?.id ?? "nova"}`}
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="ex.: Lembrete de retorno"
          className={CAMPO}
        />
      </div>

      <div>
        <label htmlFor={`p-${mensagem?.id ?? "nova"}`} className={ROTULO}>
          Quando usar{" "}
          <span className="font-normal normal-case tracking-normal">
            (opcional)
          </span>
        </label>
        <input
          id={`p-${mensagem?.id ?? "nova"}`}
          name="para"
          value={para}
          onChange={(e) => setPara(e.target.value)}
          placeholder="ex.: Enviar 3 dias antes da sessão"
          className={CAMPO}
        />
      </div>

      <div>
        <label htmlFor={`x-${mensagem?.id ?? "nova"}`} className={ROTULO}>
          Texto
        </label>
        <textarea
          id={`x-${mensagem?.id ?? "nova"}`}
          name="texto"
          rows={8}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className={`${CAMPO} resize-y leading-relaxed`}
        />
        <p className="mt-1.5 text-[0.74rem] leading-relaxed text-muted">
          Atalhos que viram o valor atual: <code>{"{site}"}</code>{" "}
          <code>{"{pontosPorSessao}"}</code> <code>{"{indicacao}"}</code>{" "}
          <code>{"{nivelEntrada}"}</code>
        </p>
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        <Salvar />
        <button
          type="button"
          onClick={aoFechar}
          className="rounded-full border border-line px-5 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function CartaoMensagem({
  mensagem,
  linkTeste,
}: {
  mensagem: MensagemEditavel;
  linkTeste: string;
}) {
  const [editando, setEditando] = useState(false);

  return (
    <li className="flex flex-col rounded-2xl border border-line bg-surface p-6">
      {editando ? (
        <FormularioMensagem
          mensagem={mensagem}
          aoFechar={() => setEditando(false)}
        />
      ) : (
        <>
          <h2 className="font-sans text-[1rem] font-semibold">
            {mensagem.titulo}
          </h2>
          {mensagem.para ? (
            <p className="mt-1 text-[0.8rem] text-muted">{mensagem.para}</p>
          ) : null}

          <pre className="mt-4 flex-1 whitespace-pre-wrap rounded-xl bg-sunken px-4 py-3.5 font-sans text-[0.86rem] leading-relaxed">
            {mensagem.pronto}
          </pre>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Copiar texto={mensagem.pronto} />
            <a
              href={`${linkTeste}?text=${encodeURIComponent(mensagem.pronto)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Testar no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Editar
            </button>
            <form
              action={excluirMensagem}
              onSubmit={(e) => {
                if (!confirm(`Excluir a mensagem “${mensagem.titulo}”?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={mensagem.id} />
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
              >
                Excluir
              </button>
            </form>
          </div>
        </>
      )}
    </li>
  );
}

/** Botão do topo que abre o formulário de mensagem nova. */
export function NovaMensagem() {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full bg-vp-green px-5 py-2.5 text-[0.84rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
      >
        + Nova mensagem
      </button>
    );
  }

  return (
    <div className="mb-7 w-full rounded-2xl border border-line bg-surface p-6">
      <h2 className="mb-4 text-[1.1rem]">Nova mensagem</h2>
      <FormularioMensagem aoFechar={() => setAberto(false)} />
    </div>
  );
}
