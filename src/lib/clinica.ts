/**
 * Dados de contato da clínica, em um lugar só.
 *
 * Antes isso estava espalhado por página, e uma informação errada precisou ser
 * caçada em cinco arquivos. Qualquer mudança de endereço ou telefone agora é
 * uma linha aqui.
 */
export const CLINICA = {
  nome: "Vitapraxis",
  lema: "Saúde, equilíbrio e bem-estar.",
  /// Versão em caixa-alta usada como fio condutor da marca, com o
  /// espaçamento entre letras vindo do CSS e não de espaços no texto.
  lemaCaixaAlta: "Saúde, equilíbrio e bem-estar",

  endereco: {
    logradouro: "R. 24 de Outubro, sala 1706",
    bairro: "Auxiliadora",
    cidade: "Porto Alegre",
    uf: "RS",
    get completo() {
      return `${this.logradouro} — ${this.bairro}, ${this.cidade}/${this.uf}`;
    },
    get curto() {
      return `${this.bairro}, ${this.cidade}/${this.uf}`;
    },
    mapa: "https://www.google.com/maps/search/?api=1&query=R.+24+de+Outubro+1706+Auxiliadora+Porto+Alegre+RS",
  },

  whatsapp: {
    exibicao: "(51) 98431-8803",
    // Formato E.164 sem símbolos, exigido pelo link do WhatsApp
    link: "https://wa.me/5551984318803",
  },

  telefone: {
    exibicao: "(51) 3737-8657",
    link: "tel:+555137378657",
  },

  email: "clinicavitapraxis@gmail.com",

  instagram: {
    usuario: "clinica_vitapraxis_portoalegre",
    link: "https://instagram.com/clinica_vitapraxis_portoalegre",
  },

  horario: {
    resumo: "Segunda a sexta, das 7h40 às 20h, e sábado, das 8h às 14h",
    curto: "Seg a Sex 7h40–20h · Sáb 8h–14h",
  },

  /// Endereço público do portal, usado nos links das mensagens de WhatsApp
  site: "https://vita-praxis.vercel.app",
} as const;
