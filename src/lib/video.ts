/**
 * Converte um link do YouTube no endereço de incorporação.
 *
 * A clínica cola o que copiou da barra do navegador ou do botão de
 * compartilhar, e esses dois formatos são diferentes — normalizar aqui evita
 * que o vídeo simplesmente não apareça por causa de onde o link foi pego.
 *
 * Devolve nulo quando não reconhece o endereço, e aí a tela cai no link
 * comum em vez de montar um player quebrado.
 */
export function incorporarVideo(url: string | null | undefined) {
  if (!url) return null;

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  // youtu.be/ID
  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    // youtube.com/watch?v=ID
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;

    // youtube.com/shorts/ID e /embed/ID já vêm prontos ou quase
    const partes = u.pathname.split("/").filter(Boolean);
    if (partes[0] === "shorts" && partes[1]) {
      return `https://www.youtube.com/embed/${partes[1]}`;
    }
    if (partes[0] === "embed" && partes[1]) return u.toString();
  }

  return null;
}
