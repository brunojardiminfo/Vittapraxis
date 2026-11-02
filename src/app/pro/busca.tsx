"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Busca por nome que leva para a lista de pacientes filtrada. */
export function BuscaPaciente({ inicial = "" }: { inicial?: string }) {
  const router = useRouter();
  const [termo, setTermo] = useState(inicial);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = termo.trim();
        router.push(q ? `/pro/pacientes?q=${encodeURIComponent(q)}` : "/pro/pacientes");
      }}
      className="flex gap-2.5"
    >
      <input
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar paciente pelo nome…"
        aria-label="Buscar paciente pelo nome"
        className="w-full rounded-full border border-line bg-surface px-5 py-3 text-[0.92rem] outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-vp-green px-6 py-3 text-[0.86rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
      >
        Buscar
      </button>
    </form>
  );
}
