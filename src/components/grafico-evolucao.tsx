import { calcularIndice } from "@/lib/format";

export type PontoEvolucao = {
  data: Date;
  humor: number;
  sono: number;
  dor: number;
};

const L = 40; // margem esquerda para os rótulos do eixo Y
const R = 12;
const T = 14;
const B = 26;
const W = 560;
const H = 220;

function caminho(valores: number[], escala: (v: number) => number) {
  const passo = valores.length > 1 ? (W - L - R) / (valores.length - 1) : 0;
  return valores
    .map((v, i) => `${i === 0 ? "M" : "L"}${L + i * passo},${escala(v)}`)
    .join(" ");
}

/**
 * Duas séries no mesmo eixo 0–10: o índice geral e o conforto (dor invertida).
 * Sem biblioteca de gráfico — o SVG é simples e renderiza no servidor.
 */
export function GraficoEvolucao({ pontos }: { pontos: PontoEvolucao[] }) {
  if (pontos.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Responda o Índice de Bem-Estar ao menos duas vezes para ver sua curva de
        evolução.
      </p>
    );
  }

  const y = (v: number) => T + (1 - v / 10) * (H - T - B);
  const passo = (W - L - R) / (pontos.length - 1);

  const indices = pontos.map((p) => calcularIndice(p.humor, p.sono, p.dor));
  const conforto = pontos.map((p) => 10 - p.dor);

  const ultimoIndice = indices[indices.length - 1];
  const xUltimo = L + (pontos.length - 1) * passo;

  return (
    <figure>
      <figcaption className="mb-4 flex flex-wrap gap-5 text-[0.82rem] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-vp-gold-deep" />
          Índice de bem-estar
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-vp-green dark:bg-vp-gold-pale" />
          Conforto (10 − dor)
        </span>
      </figcaption>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[460px]"
          role="img"
          aria-label={`Evolução do índice de bem-estar em ${pontos.length} avaliações, terminando em ${ultimoIndice.toFixed(1).replace(".", ",")} de 10.`}
        >
          {[0, 2.5, 5, 7.5, 10].map((v) => (
            <g key={v}>
              <line
                x1={L}
                y1={y(v)}
                x2={W - R}
                y2={y(v)}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={L - 8}
                y={y(v) + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-muted)"
              >
                {v}
              </text>
            </g>
          ))}

          <path
            d={caminho(conforto, y)}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <path
            d={caminho(indices, y)}
            fill="none"
            stroke="var(--color-vp-gold-deep)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {indices.map((v, i) => (
            <circle
              key={i}
              cx={L + i * passo}
              cy={y(v)}
              r={i === indices.length - 1 ? 5 : 3}
              fill="var(--color-vp-gold-deep)"
            />
          ))}

          <text
            x={xUltimo}
            y={y(ultimoIndice) - 12}
            textAnchor="end"
            fontSize="12"
            fontWeight="700"
            fill="var(--text)"
          >
            {ultimoIndice.toFixed(1).replace(".", ",")}
          </text>

          {pontos.map((p, i) => (
            <text
              key={i}
              x={L + i * passo}
              y={H - 6}
              textAnchor={i === 0 ? "start" : i === pontos.length - 1 ? "end" : "middle"}
              fontSize="10"
              fill="var(--text-muted)"
            >
              {new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              }).format(p.data)}
            </text>
          ))}
        </svg>
      </div>
    </figure>
  );
}
