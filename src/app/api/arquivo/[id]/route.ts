import { db } from "@/lib/db";

/**
 * Serve uma imagem guardada no banco.
 *
 * O conteúdo de um id nunca muda — uma troca de foto cria outro registro — por
 * isso o cache é imutável e de um ano: a imagem é baixada uma vez e some do
 * caminho crítico das próximas visitas.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const arquivo = await db.arquivo.findUnique({
    where: { id },
    select: { dados: true, tipo: true },
  });

  if (!arquivo) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  return new Response(new Uint8Array(arquivo.dados), {
    headers: {
      "Content-Type": arquivo.tipo,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
