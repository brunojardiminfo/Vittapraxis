/**
 * Tipos de material da Biblioteca de Saúde.
 *
 * Mora aqui, e não na action, porque um arquivo "use server" só pode exportar
 * funções async — exportar esta lista de lá quebra o build de produção, ainda
 * que o servidor de desenvolvimento aceite.
 */
export const TIPOS_CONTEUDO = [
  "ARTIGO",
  "VIDEO",
  "RECEITA",
  "TUTORIAL",
] as const;

export type TipoConteudo = (typeof TIPOS_CONTEUDO)[number];

export const ROTULO_CONTEUDO: Record<string, string> = {
  ARTIGO: "Artigo",
  VIDEO: "Vídeo",
  RECEITA: "Receita",
  TUTORIAL: "Tutorial",
};
