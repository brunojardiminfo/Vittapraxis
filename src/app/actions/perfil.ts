"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/auth";

/** Aceita com ou sem máscara; só exige dígitos suficientes para um número real. */
const telefone = z
  .string()
  .trim()
  .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, {
    message: "Telefone precisa ter DDD e número.",
  });

const PerfilSchema = z.object({
  telefone,
  whatsapp: telefone,
  endereco: z.string().trim().max(200),
  emergenciaNome: z.string().trim().max(120),
  emergenciaVinculo: z.string().trim().max(60),
  emergenciaFone: telefone,
});

export type EstadoPerfil = { ok?: boolean; erro?: string };

/**
 * Nome, CPF e data de nascimento não entram: são dados de identificação que a
 * clínica confere na primeira consulta e que também vivem no Clínica Ágil.
 * Aqui o paciente mantém atualizado o que muda com frequência — contato.
 */
export async function atualizarPerfil(
  _estado: EstadoPerfil,
  formData: FormData
): Promise<EstadoPerfil> {
  const u = await usuarioAtual();
  if (!u || u.papel !== "PACIENTE" || !u.perfilId) {
    return { erro: "Sessão expirada. Entre novamente." };
  }

  const parsed = PerfilSchema.safeParse({
    telefone: formData.get("telefone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    endereco: formData.get("endereco") ?? "",
    emergenciaNome: formData.get("emergenciaNome") ?? "",
    emergenciaVinculo: formData.get("emergenciaVinculo") ?? "",
    emergenciaFone: formData.get("emergenciaFone") ?? "",
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0].message };
  }

  // Campo em branco vira null, para não guardar string vazia no banco
  const vazioParaNulo = (v: string) => (v === "" ? null : v);

  await db.paciente.update({
    where: { id: u.perfilId },
    data: {
      telefone: vazioParaNulo(parsed.data.telefone),
      whatsapp: vazioParaNulo(parsed.data.whatsapp),
      endereco: vazioParaNulo(parsed.data.endereco),
      emergenciaNome: vazioParaNulo(parsed.data.emergenciaNome),
      emergenciaVinculo: vazioParaNulo(parsed.data.emergenciaVinculo),
      emergenciaFone: vazioParaNulo(parsed.data.emergenciaFone),
    },
  });

  revalidatePath("/app/perfil");
  revalidatePath("/admin");
  return { ok: true };
}
