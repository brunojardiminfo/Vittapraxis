"use client";

import { useState } from "react";
import { IconeChat } from "@/components/icones";

/**
 * Mostra o acesso recém-criado e os dois jeitos de entregá-lo.
 *
 * A senha só existe nesta tela: o banco guarda o hash. Por isso o aviso de
 * que, saindo daqui sem enviar, o caminho é gerar outra.
 */
export function EntregaAcesso({
  email,
  senha,
  mensagem,
  whatsapp,
}: {
  email: string;
  senha: string;
  mensagem: string;
  whatsapp: string | null;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissão para a área de transferência: o texto está na tela
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-sunken p-5 text-left">
      <dl className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Login
          </dt>
          <dd className="text-[0.92rem] font-medium">{email}</dd>
        </div>
        <div>
          <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Senha provisória
          </dt>
          <dd className="font-mono text-[0.98rem] font-semibold tracking-wider text-accent">
            {senha}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2.5">
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
          >
            <IconeChat className="h-4 w-4" />
            Enviar pelo WhatsApp
          </a>
        ) : null}
        <button
          type="button"
          onClick={copiar}
          className="rounded-full border border-line px-5 py-2.5 text-[0.82rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {copiado ? "Copiado!" : "Copiar mensagem"}
        </button>
      </div>

      <p className="mt-3.5 text-[0.76rem] leading-relaxed text-muted">
        {whatsapp
          ? "A senha não fica guardada: envie agora."
          : "Sem WhatsApp no cadastro — copie a mensagem e envie por onde preferir. A senha não fica guardada."}{" "}
        No primeiro acesso a pessoa cria a própria senha.
      </p>
    </div>
  );
}
