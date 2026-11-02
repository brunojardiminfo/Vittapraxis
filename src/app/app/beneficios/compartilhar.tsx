"use client";

import { useState } from "react";
import { IconeChat, IconeCheck } from "@/components/icones";

/**
 * O link e a mensagem vêm prontos do servidor — aqui só tratamos a interação,
 * que precisa do navegador: copiar para a área de transferência e abrir o
 * compartilhamento nativo do celular quando existir.
 */
export function Compartilhar({
  codigo,
  link,
  texto,
  whatsapp,
}: {
  codigo: string;
  link: string;
  texto: string;
  whatsapp: string;
}) {
  const [copiado, setCopiado] = useState<"codigo" | "link" | null>(null);

  async function copiar(valor: string, qual: "codigo" | "link") {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(qual);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Sem permissão de área de transferência: o link segue visível na tela
      // para seleção manual, então não vale interromper com um alerta.
    }
  }

  async function compartilhar() {
    // O share nativo é bem melhor no celular: abre a lista de contatos
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Clube Vitapraxis", text: texto, url: link });
        return;
      } catch {
        // Usuário fechou a folha de compartilhamento; cai no WhatsApp
      }
    }
    window.open(whatsapp, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-sunken px-4 py-3">
        <code className="font-serif tracking-widest text-brand">{codigo}</code>
        <button
          type="button"
          onClick={() => copiar(codigo, "codigo")}
          className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[0.76rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {copiado === "codigo" ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={compartilhar}
          className="inline-flex items-center gap-2 rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
        >
          <IconeChat className="h-4 w-4" />
          Convidar amigos
        </button>

        <button
          type="button"
          onClick={() => copiar(link, "link")}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[0.82rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {copiado === "link" ? (
            <>
              <IconeCheck className="h-4 w-4 text-success" />
              Link copiado
            </>
          ) : (
            "Copiar link"
          )}
        </button>
      </div>
    </div>
  );
}
