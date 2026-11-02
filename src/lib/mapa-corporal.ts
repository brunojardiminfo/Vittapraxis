/**
 * Regiões do mapa corporal, com o desenho de cada uma.
 *
 * O id é o que vai para o banco (Evolucao.regioesDor, separado por "|"), então
 * não pode mudar depois de publicado — o rótulo pode. Os desenhos são formas
 * simples num quadro de 200×440: o objetivo é apontar a região, não anatomia.
 *
 * Esquerda e direita são as do paciente. Na vista de frente, o lado esquerdo
 * do paciente fica à direita de quem olha.
 */

export type Vista = "FRENTE" | "COSTAS";

export type Regiao = {
  id: string;
  rotulo: string;
  vista: Vista;
  /** Elemento SVG: elipse (cx, cy, rx, ry) ou retângulo arredondado */
  forma:
    | { tipo: "elipse"; cx: number; cy: number; rx: number; ry: number }
    | { tipo: "ret"; x: number; y: number; w: number; h: number; r: number };
};

function par(
  base: string,
  rotulo: string,
  vista: Vista,
  forma: (lado: 1 | -1) => Regiao["forma"]
): Regiao[] {
  // Na frente, a direita do paciente aparece à esquerda do desenho
  const ladoDir: 1 | -1 = vista === "FRENTE" ? -1 : 1;
  return [
    { id: `${base}-dir`, rotulo: `${rotulo} direito(a)`, vista, forma: forma(ladoDir) },
    {
      id: `${base}-esq`,
      rotulo: `${rotulo} esquerdo(a)`,
      vista,
      forma: forma((ladoDir * -1) as 1 | -1),
    },
  ];
}

const X = 100; // eixo central

function membros(vista: Vista, prefixo: string): Regiao[] {
  // Na vista de costas o mesmo membro é a face posterior
  const r = (t: string) => (vista === "COSTAS" ? `${t} (posterior)` : t);
  return [
    ...par(`${prefixo}ombro`, r("Ombro"), vista, (l) => ({ tipo: "elipse", cx: X + l * 42, cy: 98, rx: 14, ry: 12 })),
    ...par(`${prefixo}braco`, r("Braço"), vista, (l) => ({ tipo: "ret", x: X + l * 52 - 10, y: 110, w: 20, h: 52, r: 9 })),
    ...par(`${prefixo}cotovelo`, r("Cotovelo"), vista, (l) => ({ tipo: "elipse", cx: X + l * 55, cy: 170, rx: 10, ry: 9 })),
    ...par(`${prefixo}antebraco`, r("Antebraço"), vista, (l) => ({ tipo: "ret", x: X + l * 58 - 9, y: 180, w: 18, h: 46, r: 8 })),
    ...par(`${prefixo}mao`, r("Mão/punho"), vista, (l) => ({ tipo: "elipse", cx: X + l * 61, cy: 240, rx: 10, ry: 13 })),
    ...par(`${prefixo}coxa`, r("Coxa"), vista, (l) => ({ tipo: "ret", x: X + l * 20 - 14, y: 240, w: 28, h: 68, r: 12 })),
    ...par(`${prefixo}joelho`, r("Joelho"), vista, (l) => ({ tipo: "elipse", cx: X + l * 20, cy: 318, rx: 13, ry: 11 })),
    ...par(`${prefixo}perna`, r("Perna"), vista, (l) => ({ tipo: "ret", x: X + l * 20 - 11, y: 330, w: 22, h: 66, r: 10 })),
    ...par(`${prefixo}pe`, r("Pé/tornozelo"), vista, (l) => ({ tipo: "elipse", cx: X + l * 22, cy: 410, rx: 13, ry: 10 })),
  ];
}

export const REGIOES: Regiao[] = [
  // ---- Frente
  { id: "cabeca", rotulo: "Cabeça", vista: "FRENTE", forma: { tipo: "elipse", cx: X, cy: 36, rx: 22, ry: 26 } },
  { id: "atm", rotulo: "Mandíbula / ATM", vista: "FRENTE", forma: { tipo: "elipse", cx: X, cy: 58, rx: 14, ry: 6 } },
  { id: "pescoco", rotulo: "Pescoço", vista: "FRENTE", forma: { tipo: "ret", x: X - 10, y: 66, w: 20, h: 18, r: 6 } },
  { id: "peito", rotulo: "Peito", vista: "FRENTE", forma: { tipo: "ret", x: X - 30, y: 90, w: 60, h: 50, r: 14 } },
  { id: "abdomen", rotulo: "Abdômen", vista: "FRENTE", forma: { tipo: "ret", x: X - 26, y: 144, w: 52, h: 52, r: 14 } },
  { id: "quadril", rotulo: "Quadril / virilha", vista: "FRENTE", forma: { tipo: "ret", x: X - 32, y: 200, w: 64, h: 36, r: 14 } },
  ...membros("FRENTE", ""),

  // ---- Costas
  { id: "nuca", rotulo: "Nuca / cabeça (trás)", vista: "COSTAS", forma: { tipo: "elipse", cx: X, cy: 36, rx: 22, ry: 26 } },
  { id: "cervical", rotulo: "Coluna cervical", vista: "COSTAS", forma: { tipo: "ret", x: X - 10, y: 64, w: 20, h: 22, r: 6 } },
  ...par("escapula", "Escápula", "COSTAS", (l) => ({ tipo: "elipse", cx: X + l * 18, cy: 112, rx: 14, ry: 18 })),
  { id: "toracica", rotulo: "Coluna torácica", vista: "COSTAS", forma: { tipo: "ret", x: X - 6, y: 90, w: 12, h: 64, r: 5 } },
  { id: "lombar", rotulo: "Coluna lombar", vista: "COSTAS", forma: { tipo: "ret", x: X - 26, y: 158, w: 52, h: 40, r: 12 } },
  { id: "sacro", rotulo: "Sacro / cóccix", vista: "COSTAS", forma: { tipo: "elipse", cx: X, cy: 208, rx: 12, ry: 9 } },
  ...par("gluteo", "Glúteo", "COSTAS", (l) => ({ tipo: "elipse", cx: X + l * 18, cy: 224, rx: 17, ry: 14 })),
  ...membros("COSTAS", "post-"),
];

/** Rótulos legíveis a partir dos ids gravados. */
export function rotulosDe(ids: string[]) {
  const mapa = new Map(REGIOES.map((r) => [r.id, r.rotulo]));
  return ids.map((id) => mapa.get(id) ?? id);
}

export function lerRegioes(valor: string | null | undefined) {
  return valor ? valor.split("|").filter(Boolean) : [];
}
