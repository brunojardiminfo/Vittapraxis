"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { enviarImagem, type EstadoUpload } from "@/app/actions/arquivos";

export type ImagemEnviada = { id: string; caminho: string; nome: string };

/**
 * Aponta para o formulário de envio pelo atributo form: o botão mora dentro
 * do formulário do cartão, e sem isso enviaria o cartão inteiro.
 */
function BotaoEnviar({ form, pending }: { form: string; pending: boolean }) {
  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      className="rounded-full border border-accent px-4 py-2 text-[0.8rem] font-semibold text-accent transition-colors hover:bg-accent hover:text-[var(--on-brand)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Enviar"}
    </button>
  );
}

/**
 * Escolhe a foto do cartão: envia uma nova ou reaproveita uma já enviada.
 *
 * O valor escolhido viaja num input oculto, porque o formulário do cartão é
 * quem salva — este bloco só decide qual caminho vai nele. Enviar a imagem é
 * uma ação separada e imediata: a foto precisa existir antes de o cartão
 * apontar para ela.
 */
export function SeletorImagem({
  nome,
  valorInicial,
  doRepositorio,
  enviadas,
}: {
  nome: string;
  valorInicial: string;
  /** Imagens que já vêm no projeto, em /public */
  doRepositorio: string[];
  /** Imagens que a clínica subiu */
  enviadas: ImagemEnviada[];
}) {
  const [estado, formAction, enviando] = useActionState<
    EstadoUpload,
    FormData
  >(enviarImagem, {});
  // Um id por seletor: a lista de cartões em edição pode ter vários na tela
  const idEnvio = `envio-imagem-${useId().replace(/:/g, "")}`;
  // O formulário de envio vai direto no <body>: dentro do formulário do
  // cartão ele seria um <form> aninhado, que o HTML não permite
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const [escolhida, setEscolhida] = useState(valorInicial);
  const [novas, setNovas] = useState<string[]>([]);
  const campoArquivo = useRef<HTMLInputElement>(null);

  // Subiu: a nova entra na galeria e já fica marcada
  useEffect(() => {
    if (estado.ok && estado.caminho) {
      setNovas((n) => (n.includes(estado.caminho!) ? n : [estado.caminho!, ...n]));
      setEscolhida(estado.caminho);
      if (campoArquivo.current) campoArquivo.current.value = "";
    }
  }, [estado.ok, estado.caminho]);

  const galeria = [
    ...novas.map((c) => ({ caminho: c, rotulo: "enviada agora" })),
    ...enviadas.map((e) => ({ caminho: e.caminho, rotulo: e.nome })),
    ...doRepositorio.map((c) => ({ caminho: c, rotulo: c.split("/").pop()! })),
  ];

  return (
    <div>
      <input type="hidden" name={nome} value={escolhida} />

      <p className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Imagem do cartão{" "}
        <span className="font-normal normal-case tracking-normal">
          (opcional)
        </span>
      </p>

      {/* O envio é um formulário à parte, ligado pelo atributo form */}
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-dashed border-line bg-sunken p-3">
        <input
          ref={campoArquivo}
          type="file"
          name="arquivo"
          accept="image/jpeg,image/png,image/webp,image/avif"
          form={idEnvio}
          className="min-w-0 flex-1 text-[0.82rem] text-muted file:mr-3 file:rounded-full file:border file:border-line file:bg-surface file:px-4 file:py-2 file:text-[0.8rem] file:font-semibold file:text-ink hover:file:border-accent"
        />
        <BotaoEnviar form={idEnvio} pending={enviando} />
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {galeria.length > 0 ? (
        <>
          <div className="grid max-h-64 grid-cols-3 gap-2.5 overflow-y-auto sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setEscolhida("")}
              className={`flex aspect-4/3 items-center justify-center rounded-xl border text-[0.76rem] font-semibold transition-colors ${
                escolhida === ""
                  ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_14%,transparent)] text-accent"
                  : "border-line text-muted hover:border-accent"
              }`}
            >
              Sem foto
            </button>

            {galeria.map((g) => (
              <button
                key={g.caminho}
                type="button"
                onClick={() => setEscolhida(g.caminho)}
                title={g.rotulo}
                className={`relative aspect-4/3 overflow-hidden rounded-xl border transition-colors ${
                  escolhida === g.caminho
                    ? "border-accent ring-2 ring-accent"
                    : "border-line hover:border-accent"
                }`}
              >
                <Image
                  src={g.caminho}
                  alt={g.rotulo}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <p className="mt-2 text-[0.76rem] text-muted">
            A imagem entra no topo do cartão, cortada em proporção larga.
          </p>
        </>
      ) : null}

      {montado
        ? createPortal(
            <form id={idEnvio} action={formAction} className="hidden" />,
            document.body
          )
        : null}
    </div>
  );
}
