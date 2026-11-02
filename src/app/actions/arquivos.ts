"use server";

import sharp from "sharp";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

/** Teto do que a clínica pode enviar, antes de qualquer processamento. */
const LIMITE_BYTES = 8 * 1024 * 1024;

const ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type EstadoUpload = {
  ok?: boolean;
  erro?: string;
  /** Caminho pronto para usar em <Image src> */
  caminho?: string;
};

/**
 * Recebe uma imagem do admin e guarda no banco.
 *
 * Converte para webp e limita a 1600px de largura antes de gravar: a clínica
 * envia foto de celular com vários megabytes, e um cartão de oferta nunca
 * precisa disso. O que entra com 6 MB sai com algumas dezenas de quilobytes,
 * que é o que torna viável guardar no próprio banco.
 */
export async function enviarImagem(
  _estado: EstadoUpload,
  formData: FormData
): Promise<EstadoUpload> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return { erro: "Sem permissão." };

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha uma imagem." };
  }

  if (arquivo.size > LIMITE_BYTES) {
    return { erro: "A imagem precisa ter no máximo 8 MB." };
  }

  if (!ACEITOS.includes(arquivo.type)) {
    return { erro: "Envie um JPG, PNG, WebP ou AVIF." };
  }

  try {
    const entrada = Buffer.from(await arquivo.arrayBuffer());

    const saida = await sharp(entrada)
      .rotate() // respeita a orientação do EXIF, senão foto de celular deita
      .resize(1600, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const criado = await db.arquivo.create({
      data: {
        nome: arquivo.name.replace(/\.[^.]+$/, "") || "imagem",
        tipo: "image/webp",
        // new Uint8Array: o Buffer do sharp pode vir sobre SharedArrayBuffer,
        // que o tipo de Bytes do Prisma não aceita
        dados: new Uint8Array(saida.data),
        largura: saida.info.width,
        altura: saida.info.height,
        tamanho: saida.data.byteLength,
      },
      select: { id: true },
    });

    return { ok: true, caminho: `/api/arquivo/${criado.id}` };
  } catch {
    return { erro: "Não consegui ler essa imagem. Tente outro arquivo." };
  }
}

/** Remove uma imagem enviada. Os cartões que a usavam ficam sem foto. */
export async function excluirImagem(id: string) {
  const u = await usuarioAtual();
  if (!u || u.papel !== "ADMIN") return;

  await db.arquivo.deleteMany({ where: { id } });
}
