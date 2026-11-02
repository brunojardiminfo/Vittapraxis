"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { salvarDestaque, type EstadoDestaque } from "@/app/actions/destaques";
import { SeletorImagem, type ImagemEnviada } from "./seletor-imagem";

export type DestaqueEditavel = {
  id: string;
  titulo: string;
  texto: string;
  etiqueta: string | null;
  imagem: string | null;
  link: string | null;
  linkTexto: string | null;
  ordem: number;
  inicioEm: string;
  fimEm: string;
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted";

function Criar({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-6 py-3 text-[0.85rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : editando ? "Salvar alterações" : "Criar cartão"}
    </button>
  );
}

export function FormularioDestaque({
  imagens,
  enviadas,
  destaque,
  aoFechar,
}: {
  imagens: string[];
  enviadas: ImagemEnviada[];
  destaque?: DestaqueEditavel;
  aoFechar?: () => void;
}) {
  const [estado, formAction] = useActionState<EstadoDestaque, FormData>(
    salvarDestaque,
    {}
  );

  const editando = !!destaque;

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [titulo, setTitulo] = useState(destaque?.titulo ?? "");
  const [texto, setTexto] = useState(destaque?.texto ?? "");
  const [etiqueta, setEtiqueta] = useState(destaque?.etiqueta ?? "");
  const [link, setLink] = useState(destaque?.link ?? "");
  const [linkTexto, setLinkTexto] = useState(destaque?.linkTexto ?? "");
  const [ordem, setOrdem] = useState(String(destaque?.ordem ?? 0));
  const [inicioEm, setInicioEm] = useState(destaque?.inicioEm ?? "");
  const [fimEm, setFimEm] = useState(destaque?.fimEm ?? "");

  useEffect(() => {
    if (estado.ok && !editando) {
      setTitulo("");
      setTexto("");
      setEtiqueta("");
      setLink("");
      setLinkTexto("");
      setInicioEm("");
      setFimEm("");
    }
  }, [estado.ok, editando]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-line bg-surface p-7"
    >
      {destaque ? <input type="hidden" name="id" value={destaque.id} /> : null}

      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[1.15rem]">
          {editando ? "Editar cartão" : "Novo cartão"}
        </h2>
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

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor={`titulo-${destaque?.id ?? "novo"}`} className={ROTULO}>
            Título
          </label>
          <input
            id={`titulo-${destaque?.id ?? "novo"}`}
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="ex.: Pacote de 6 sessões"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor={`texto-${destaque?.id ?? "novo"}`} className={ROTULO}>
            Texto
          </label>
          <textarea
            id={`texto-${destaque?.id ?? "novo"}`}
            name="texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            className={`${CAMPO} resize-y`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`etiqueta-${destaque?.id ?? "novo"}`} className={ROTULO}>
              Etiqueta{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </label>
            <input
              id={`etiqueta-${destaque?.id ?? "novo"}`}
              name="etiqueta"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              placeholder="ex.: Só até sexta"
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor={`ordem-${destaque?.id ?? "novo"}`} className={ROTULO}>
              Ordem
            </label>
            <input
              id={`ordem-${destaque?.id ?? "novo"}`}
              name="ordem"
              type="number"
              min={0}
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className={CAMPO}
            />
          </div>
        </div>

        <SeletorImagem
          nome="imagem"
          valorInicial={destaque?.imagem ?? ""}
          doRepositorio={imagens}
          enviadas={enviadas}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`link-${destaque?.id ?? "novo"}`} className={ROTULO}>
              Link{" "}
              <span className="font-normal normal-case tracking-normal">
                (opcional)
              </span>
            </label>
            <input
              id={`link-${destaque?.id ?? "novo"}`}
              name="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/app/agendamentos/solicitar"
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor={`linkTexto-${destaque?.id ?? "novo"}`} className={ROTULO}>
              Texto do botão
            </label>
            <input
              id={`linkTexto-${destaque?.id ?? "novo"}`}
              name="linkTexto"
              value={linkTexto}
              onChange={(e) => setLinkTexto(e.target.value)}
              placeholder="Quero aproveitar"
              className={CAMPO}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`inicioEm-${destaque?.id ?? "novo"}`} className={ROTULO}>
              Começa em
            </label>
            <input
              id={`inicioEm-${destaque?.id ?? "novo"}`}
              name="inicioEm"
              type="date"
              value={inicioEm}
              onChange={(e) => setInicioEm(e.target.value)}
              className={CAMPO}
            />
          </div>

          <div>
            <label htmlFor={`fimEm-${destaque?.id ?? "novo"}`} className={ROTULO}>
              Termina em
            </label>
            <input
              id={`fimEm-${destaque?.id ?? "novo"}`}
              name="fimEm"
              type="date"
              value={fimEm}
              onChange={(e) => setFimEm(e.target.value)}
              className={CAMPO}
            />
          </div>
        </div>

        <p className="rounded-xl bg-sunken px-4 py-3 text-[0.8rem] leading-relaxed text-muted">
          Datas em branco valem para sempre. Passada a data final, o cartão
          some do portal sozinho — não precisa lembrar de desligar.
        </p>

        {estado.erro ? (
          <p
            role="alert"
            className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
          >
            {estado.erro}
          </p>
        ) : null}

        {estado.ok ? (
          <p
            role="status"
            className="rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success"
          >
            {editando
              ? "Alterações salvas."
              : "Criado. Já aparece no portal do paciente."}
          </p>
        ) : null}

        <Criar editando={editando} />
      </div>
    </form>
  );
}
