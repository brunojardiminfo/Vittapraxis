"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { salvarConteudo, type EstadoConteudo } from "@/app/actions/conteudos";
import { ROTULO_CONTEUDO, TIPOS_CONTEUDO } from "@/lib/conteudo";

export type ConteudoEditavel = {
  id: string;
  titulo: string;
  resumo: string;
  corpo: string;
  tipo: string;
  categoria: string;
  url: string | null;
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted";

function Salvar({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-6 py-3 text-[0.85rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : editando ? "Salvar alterações" : "Publicar"}
    </button>
  );
}

export function FormularioConteudo({
  conteudo,
  aoFechar,
}: {
  conteudo?: ConteudoEditavel;
  aoFechar?: () => void;
}) {
  const [estado, formAction] = useActionState<EstadoConteudo, FormData>(
    salvarConteudo,
    {}
  );

  const editando = !!conteudo;

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro apagaria o texto inteiro já escrito.
  const [titulo, setTitulo] = useState(conteudo?.titulo ?? "");
  const [resumo, setResumo] = useState(conteudo?.resumo ?? "");
  const [corpo, setCorpo] = useState(conteudo?.corpo ?? "");
  const [tipo, setTipo] = useState<string>(conteudo?.tipo ?? "ARTIGO");
  const [categoria, setCategoria] = useState(conteudo?.categoria ?? "");
  const [url, setUrl] = useState(conteudo?.url ?? "");

  // Publicou um novo: esvazia para o próximo. Na edição, os campos ficam.
  useEffect(() => {
    if (estado.ok && !editando) {
      setTitulo("");
      setResumo("");
      setCorpo("");
      setCategoria("");
      setUrl("");
    }
  }, [estado.ok, editando]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-line bg-surface p-7"
    >
      {conteudo ? <input type="hidden" name="id" value={conteudo.id} /> : null}

      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[1.15rem]">
          {editando ? "Editar conteúdo" : "Publicar na biblioteca"}
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
          <label htmlFor={`titulo-${conteudo?.id ?? "novo"}`} className={ROTULO}>
            Título
          </label>
          <input
            id={`titulo-${conteudo?.id ?? "novo"}`}
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={CAMPO}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`tipo-${conteudo?.id ?? "novo"}`} className={ROTULO}>
              Tipo
            </label>
            <select
              id={`tipo-${conteudo?.id ?? "novo"}`}
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={CAMPO}
            >
              {TIPOS_CONTEUDO.map((t) => (
                <option key={t} value={t}>
                  {ROTULO_CONTEUDO[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`categoria-${conteudo?.id ?? "novo"}`}
              className={ROTULO}
            >
              Categoria
            </label>
            <input
              id={`categoria-${conteudo?.id ?? "novo"}`}
              name="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="ex.: Postura, Nutrição, Sono"
              className={CAMPO}
            />
          </div>
        </div>

        {/* O campo do link só existe para vídeo — em artigo, seria ruído */}
        {tipo === "VIDEO" ? (
          <div>
            <label htmlFor={`url-${conteudo?.id ?? "novo"}`} className={ROTULO}>
              Link do vídeo
            </label>
            <input
              id={`url-${conteudo?.id ?? "novo"}`}
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={CAMPO}
            />
            <p className="mt-1.5 text-[0.76rem] text-muted">
              Cole o endereço do YouTube. O paciente assiste dentro do portal.
            </p>
          </div>
        ) : null}

        <div>
          <label htmlFor={`resumo-${conteudo?.id ?? "novo"}`} className={ROTULO}>
            Resumo
          </label>
          <input
            id={`resumo-${conteudo?.id ?? "novo"}`}
            name="resumo"
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            placeholder="Uma linha, é o que aparece no cartão"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor={`corpo-${conteudo?.id ?? "novo"}`} className={ROTULO}>
            Conteúdo
          </label>
          <textarea
            id={`corpo-${conteudo?.id ?? "novo"}`}
            name="corpo"
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
            rows={editando ? 5 : 8}
            className={`${CAMPO} resize-y`}
          />
        </div>

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
              : "Publicado. Já aparece na biblioteca do paciente."}
          </p>
        ) : null}

        <Salvar editando={editando} />
      </div>
    </form>
  );
}
