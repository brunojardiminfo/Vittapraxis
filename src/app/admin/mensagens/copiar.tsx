"use client";

import { useState } from "react";

/**
 * Copia o texto para a área de transferência.
 *
 * A confirmação some sozinha: sem ela, não dá para saber se o clique pegou, e
 * um aviso permanente poluiria a lista de seis cartões.
 */
export function Copiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Navegador sem permissão para a área de transferência: o texto está
      // visível na tela, então dá para selecionar à mão
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="rounded-full bg-vp-green px-5 py-2 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {copiado ? "Copiado!" : "Copiar"}
    </button>
  );
}
