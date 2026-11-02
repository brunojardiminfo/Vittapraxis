"use client";

import { useState } from "react";
import { REGIOES, rotulosDe, type Regiao, type Vista } from "@/lib/mapa-corporal";

function Forma({
  regiao,
  className,
  onClick,
  titulo,
}: {
  regiao: Regiao;
  className: string;
  onClick?: () => void;
  titulo: string;
}) {
  const f = regiao.forma;
  const props = {
    className,
    onClick,
    role: onClick ? "button" : undefined,
    "aria-label": onClick ? titulo : undefined,
    tabIndex: onClick ? 0 : undefined,
    onKeyDown: onClick
      ? (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }
      : undefined,
  };
  return f.tipo === "elipse" ? (
    <ellipse cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry} {...props}>
      <title>{titulo}</title>
    </ellipse>
  ) : (
    <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={f.r} {...props}>
      <title>{titulo}</title>
    </rect>
  );
}

function Boneco({
  vista,
  marcadas,
  contagem,
  alternar,
}: {
  vista: Vista;
  marcadas: Set<string>;
  contagem?: Record<string, number>;
  alternar?: (id: string) => void;
}) {
  const maximo = contagem ? Math.max(1, ...Object.values(contagem)) : 1;

  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 440"
        className="h-auto w-full max-w-[180px]"
        aria-label={`Corpo visto de ${vista === "FRENTE" ? "frente" : "costas"}`}
      >
        {REGIOES.filter((r) => r.vista === vista).map((r) => {
          const vezes = contagem?.[r.id] ?? 0;
          const ativa = marcadas.has(r.id) || vezes > 0;
          // No histórico, a força da cor diz quantas vezes a região apareceu
          const forca = contagem && vezes > 0 ? 0.35 + 0.65 * (vezes / maximo) : 1;
          return (
            <g key={r.id} opacity={ativa ? forca : 1}>
              <Forma
                regiao={r}
                titulo={vezes > 1 ? `${r.rotulo} — ${vezes}×` : r.rotulo}
                onClick={alternar ? () => alternar(r.id) : undefined}
                className={`stroke-line stroke-[1.5] transition-colors ${
                  ativa ? "fill-[#d9534f]" : "fill-sunken"
                } ${
                  alternar
                    ? "cursor-pointer outline-none hover:fill-[#e8a19e] focus-visible:stroke-accent focus-visible:stroke-[3]"
                    : ""
                }`}
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
        {vista === "FRENTE" ? "Frente" : "Costas"}
      </figcaption>
    </figure>
  );
}

/**
 * Mapa corporal para marcar onde dói.
 *
 * Editável no registro do atendimento e no questionário do paciente: clicar
 * marca e desmarca, e as regiões vão num campo escondido (ou para quem
 * escuta aoMudar). Só leitura na ficha, com contagem: aí a cor mais forte
 * mostra o que mais se repete.
 */
export function MapaCorporal({
  nome,
  inicial = [],
  contagem,
  aoMudar,
  dica = "Toque nas regiões onde a pessoa sente dor.",
}: {
  /** Nome do campo do formulário */
  nome?: string;
  inicial?: string[];
  contagem?: Record<string, number>;
  /** Para quem guarda as regiões fora do mapa, como o questionário em passos */
  aoMudar?: (ids: string[]) => void;
  dica?: string;
}) {
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set(inicial));
  const editavel = Boolean(nome || aoMudar);

  function alternar(id: string) {
    const novo = new Set(marcadas);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setMarcadas(novo);
    aoMudar?.([...novo]);
  }

  const lista = contagem
    ? Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .map(([id, n]) => `${rotulosDe([id])[0]}${n > 1 ? ` (${n}×)` : ""}`)
    : rotulosDe([...marcadas]);

  return (
    <div>
      {nome ? (
        <input type="hidden" name={nome} value={[...marcadas].join("|")} />
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        {(["FRENTE", "COSTAS"] as const).map((v) => (
          <Boneco
            key={v}
            vista={v}
            marcadas={contagem ? new Set() : marcadas}
            contagem={contagem}
            alternar={editavel ? alternar : undefined}
          />
        ))}
      </div>

      <p className="mt-3 text-[0.82rem] leading-relaxed">
        {lista.length > 0 ? (
          lista.join(" · ")
        ) : (
          <span className="text-muted">
            {editavel ? dica : "Nenhuma região marcada."}
          </span>
        )}
      </p>
    </div>
  );
}
