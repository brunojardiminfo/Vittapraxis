"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { redefinirSenha, type EstadoAcesso } from "@/app/actions/acessos";
import { EntregaAcesso } from "@/components/entrega-acesso";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
    >
      {pending ? "Gerando…" : "Gerar nova senha"}
    </button>
  );
}

/** Para o paciente que esqueceu a senha: sai uma provisória pelo WhatsApp. */
export function NovaSenhaPaciente({ usuarioId }: { usuarioId: string }) {
  const [estado, formAction] = useActionState<EstadoAcesso, FormData>(
    redefinirSenha,
    {}
  );

  if (estado.entrega) {
    return (
      <div className="mb-7 max-w-xl">
        <EntregaAcesso {...estado.entrega} />
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <Enviar />
      {estado.erro ? (
        <p role="alert" className="mt-2 text-[0.8rem] text-danger">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
