/**
 * Monta link de conversa a partir de um telefone digitado por gente.
 *
 * Os números chegam com máscara, com ou sem DDI, às vezes com o 9 e às vezes
 * sem. O WhatsApp precisa de E.164 sem símbolos, então normalizamos aqui em
 * vez de espalhar `replace(/\D/g)` por cada tela.
 */
export function linkWhatsapp(numero: string | null | undefined, texto?: string) {
  if (!numero) return null;

  let digitos = numero.replace(/\D/g, "");
  if (!digitos) return null;

  // Sem DDI, assume Brasil. 10 ou 11 dígitos = DDD + número.
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;

  // Curto demais para ser um telefone válido
  if (digitos.length < 12) return null;

  const base = `https://wa.me/${digitos}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
