import { moeda } from "@/lib/format";

export type Barra = {
  rotulo: string;
  valor: number;
  /** Texto opcional à direita; se ausente, mostra o valor formatado */
  detalhe?: string;
};

/**
 * Lista de barras horizontais. Escolhida em vez de pizza porque comparar
 * comprimentos é mais preciso que comparar ângulos, e os rótulos cabem.
 */
export function Barras({
  dados,
  formato = "numero",
  vazio = "Sem dados no período.",
}: {
  dados: Barra[];
  formato?: "numero" | "moeda";
  vazio?: string;
}) {
  if (dados.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{vazio}</p>;
  }

  const maximo = Math.max(...dados.map((d) => d.valor), 1);

  return (
    <ul className="flex flex-col gap-3.5">
      {dados.map((d) => (
        <li key={d.rotulo}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.84rem]">
            <span className="truncate">{d.rotulo}</span>
            <span className="shrink-0 font-semibold tabular-nums">
              {d.detalhe ??
                (formato === "moeda" ? moeda(d.valor) : d.valor.toLocaleString("pt-BR"))}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full bg-gradient-to-r from-vp-gold-deep to-vp-gold"
              style={{ width: `${(d.valor / maximo) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Colunas verticais — usado para ocupação dia a dia. */
export function Colunas({
  dados,
}: {
  dados: { rotulo: string; sub: string; valor: number }[];
}) {
  const maximo = Math.max(...dados.map((d) => d.valor), 1);

  return (
    <ul className="flex items-end gap-2.5" style={{ height: 150 }}>
      {dados.map((d) => (
        <li key={d.rotulo + d.sub} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[0.74rem] font-semibold tabular-nums text-muted">
            {d.valor}
          </span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-vp-gold-deep to-vp-gold transition-all"
            style={{
              // Altura mínima mantém a coluna visível mesmo com zero sessões
              height: `${Math.max((d.valor / maximo) * 100, 3)}%`,
            }}
          />
          <span className="text-[0.72rem] font-semibold capitalize">
            {d.rotulo}
          </span>
          <span className="text-[0.68rem] text-muted">{d.sub}</span>
        </li>
      ))}
    </ul>
  );
}
