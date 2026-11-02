/**
 * Quem construiu e mantém a plataforma.
 *
 * Separado de CLINICA de propósito: são duas entidades diferentes, e misturar
 * as duas faria o crédito sumir junto numa troca de dados da clínica.
 */
export const DESENVOLVEDOR = {
  nome: "BJ Solutions",

  whatsapp: {
    exibicao: "(51) 99722-8290",
    // E.164 sem símbolos, que é o formato do link do WhatsApp
    link: "https://wa.me/5551997228290",
  },
} as const;
