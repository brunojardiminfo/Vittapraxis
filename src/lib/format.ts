const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function moeda(v: number) {
  return BRL.format(v);
}

export function dataLonga(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function dataCurta(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function hora(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function diaMes(d: Date) {
  return {
    dia: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(d),
    mes: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(d)
      .replace(".", ""),
  };
}

export function duracao(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/** Escalas do Índice de Bem-Estar traduzidas para rótulos legíveis. */
export const ROTULO_HUMOR = ["", "Muito baixo", "Baixo", "Neutro", "Bom", "Excelente"];
export const ROTULO_SONO = ["", "Muito ruim", "Ruim", "Regular", "Bom", "Excelente"];

export function faixaDor(dor: number) {
  if (dor <= 2) return { rotulo: "Leve", tom: "success" as const };
  if (dor <= 4) return { rotulo: "Moderada", tom: "success" as const };
  if (dor <= 6) return { rotulo: "Considerável", tom: "warning" as const };
  return { rotulo: "Intensa", tom: "danger" as const };
}

/**
 * Índice geral 0–10: humor e sono entram normalizados (1–5 → 0–10) e a dor
 * entra invertida, já que dor alta significa bem-estar baixo.
 */
export function calcularIndice(humor: number, sono: number, dor: number) {
  const h = ((humor - 1) / 4) * 10;
  const s = ((sono - 1) / 4) * 10;
  const d = 10 - dor;
  return Math.round(((h + s + d) / 3) * 10) / 10;
}

export const ROTULO_STATUS: Record<string, { texto: string; tom: string }> = {
  AGENDADO: { texto: "Aguardando confirmação", tom: "warning" },
  CONFIRMADO: { texto: "Confirmado", tom: "success" },
  EM_ATENDIMENTO: { texto: "Em sala", tom: "success" },
  CONCLUIDO: { texto: "Concluído", tom: "muted" },
  CANCELADO: { texto: "Cancelado", tom: "danger" },
};

/**
 * Distância em linguagem de gente: "há 2 dias", "há 3 meses".
 *
 * A gestão quer saber se o paciente anda sumido, e uma data absoluta obriga
 * quem lê a fazer a conta de cabeça.
 */
export function haQuantoTempo(d: Date | null | undefined) {
  if (!d) return null;

  const segundos = Math.floor((Date.now() - d.getTime()) / 1000);
  if (segundos < 60) return "agora há pouco";

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} ${horas === 1 ? "hora" : "horas"}`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;

  const meses = Math.floor(dias / 30);
  if (meses < 12) return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;

  const anos = Math.floor(meses / 12);
  return `há ${anos} ${anos === 1 ? "ano" : "anos"}`;
}

/**
 * Com que frequência o paciente aparece.
 *
 * Mede pelo intervalo médio entre as sessões já realizadas, e não por uma
 * média mensal: quem fez dez sessões em dois meses e sumiu teria a mesma
 * média de quem vem toda semana há meio ano.
 */
export function frequencia(datas: Date[]) {
  if (datas.length < 2) return null;

  const ordenadas = [...datas].sort((a, b) => a.getTime() - b.getTime());
  const vaos: number[] = [];
  for (let i = 1; i < ordenadas.length; i++) {
    vaos.push(ordenadas[i].getTime() - ordenadas[i - 1].getTime());
  }

  const mediaDias = Math.round(
    vaos.reduce((s, v) => s + v, 0) / vaos.length / 86_400_000
  );

  if (mediaDias <= 9) return { dias: mediaDias, texto: "cerca de 1x por semana" };
  if (mediaDias <= 18) return { dias: mediaDias, texto: "a cada 2 semanas" };
  if (mediaDias <= 45) return { dias: mediaDias, texto: "cerca de 1x por mês" };
  if (mediaDias <= 100) return { dias: mediaDias, texto: "a cada 2 ou 3 meses" };
  return { dias: mediaDias, texto: "esporádico" };
}
