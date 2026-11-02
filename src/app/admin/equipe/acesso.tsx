"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  criarAcessoProfissional,
  redefinirSenha,
  removerAcessoProfissional,
  type EstadoAcesso,
} from "@/app/actions/acessos";
import { EntregaAcesso } from "@/components/entrega-acesso";

const CAMPO =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.86rem] outline-none focus:border-accent";

function Enviar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-4 py-2 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Gerando…" : texto}
    </button>
  );
}

/**
 * Login do profissional no portal: criar, gerar senha nova ou remover.
 *
 * Fica dentro do cartão da equipe porque é ali que a administração já
 * procura a pessoa — uma tela à parte de "usuários" seria mais um lugar para
 * lembrar que existe.
 */
export function AcessoProfissional({
  profissionalId,
  usuario,
}: {
  profissionalId: string;
  usuario: { id: string; email: string; ultimoAcesso: string | null } | null;
}) {
  const [criar, acaoCriar] = useActionState<EstadoAcesso, FormData>(
    criarAcessoProfissional,
    {}
  );
  const [reset, acaoReset] = useActionState<EstadoAcesso, FormData>(
    redefinirSenha,
    {}
  );
  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const entrega = criar.entrega ?? reset.entrega;
  const erro = criar.erro ?? reset.erro;

  return (
    <div className="mt-4 rounded-xl border border-line bg-sunken px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.82rem]">
          <span className="font-semibold">Portal do profissional: </span>
          {usuario ? (
            <span className="text-muted">
              {usuario.email}
              {usuario.ultimoAcesso ? ` · último acesso ${usuario.ultimoAcesso}` : " · ainda não entrou"}
            </span>
          ) : (
            <span className="text-muted">sem acesso</span>
          )}
        </p>

        {!entrega ? (
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="text-[0.8rem] font-semibold text-accent hover:underline"
          >
            {aberto ? "Fechar" : usuario ? "Gerenciar" : "Criar acesso"}
          </button>
        ) : null}
      </div>

      {entrega ? (
        <div className="mt-3.5">
          <EntregaAcesso {...entrega} />
        </div>
      ) : aberto ? (
        <div className="mt-3.5">
          {usuario ? (
            <div className="flex flex-wrap items-end gap-2.5">
              <form action={acaoReset} className="flex flex-wrap items-end gap-2.5">
                <input type="hidden" name="usuarioId" value={usuario.id} />
                <input
                  name="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp (opcional)"
                  aria-label="WhatsApp do profissional"
                  className={`${CAMPO} max-w-[13rem]`}
                />
                <Enviar texto="Gerar nova senha" />
              </form>
              <form action={removerAcessoProfissional}>
                <input type="hidden" name="profissionalId" value={profissionalId} />
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
                >
                  Remover acesso
                </button>
              </form>
            </div>
          ) : (
            <form action={acaoCriar} className="grid gap-2.5 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
              <input type="hidden" name="profissionalId" value={profissionalId} />
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e-mail de login"
                aria-label="E-mail de login"
                className={CAMPO}
              />
              <input
                name="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (opcional)"
                aria-label="WhatsApp do profissional"
                className={CAMPO}
              />
              <Enviar texto="Criar acesso" />
            </form>
          )}
        </div>
      ) : null}

      {erro ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.8rem] font-medium text-danger"
        >
          {erro}
        </p>
      ) : null}
    </div>
  );
}
