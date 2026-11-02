"use client";

import { useState } from "react";
import { conteudoIcs } from "@/lib/calendario";
import { IconeRelogio } from "@/components/icones";

export function AdicionarAgenda({
  googleLink,
  titulo,
  inicio,
  duracaoMin,
  local,
  detalhes,
  id,
}: {
  googleLink: string;
  titulo: string;
  inicio: string; // ISO — Date não serializa em props de client component
  duracaoMin: number;
  local?: string;
  detalhes?: string;
  id: string;
}) {
  const [aberto, setAberto] = useState(false);

  function baixarIcs() {
    const ics = conteudoIcs({
      titulo,
      inicio: new Date(inicio),
      duracaoMin,
      local,
      detalhes,
      id,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitapraxis-${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setAberto(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        <IconeRelogio className="h-4 w-4" />
        Adicionar à agenda
      </button>

      {aberto ? (
        <>
          {/* Fecha ao clicar fora, sem precisar de lib de posicionamento */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
            <a
              href={googleLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAberto(false)}
              className="block px-4 py-3 text-[0.84rem] font-medium transition-colors hover:bg-sunken"
            >
              Google Agenda
            </a>
            <button
              type="button"
              onClick={baixarIcs}
              className="block w-full px-4 py-3 text-left text-[0.84rem] font-medium transition-colors hover:bg-sunken"
            >
              Apple / Outlook (.ics)
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
