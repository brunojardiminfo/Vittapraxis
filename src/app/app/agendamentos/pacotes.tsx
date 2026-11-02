"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  registrarPacote,
  usarSessaoPacote,
  excluirPacote,
  type EstadoPacote,
} from "@/app/actions/pacotes";
import { Progress } from "@/components/ui";
import { IconeCartao } from "@/components/icones";

export type PacoteAtivo = {
  id: string;
  servicoNome: string;
  sessoesContratadas: number;
  sessoesUtilizadas: number;
  validade: string;
};

export type ServicoOpcao = { id: string; nome: string };

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.86rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar pacote"}
    </button>
  );
}

/**
 * Contador de pacote dentro da agenda.
 *
 * Fica aqui e não numa página própria porque é onde a pergunta nasce: a
 * pessoa abre a agenda para ver a próxima sessão e quer saber quantas ainda
 * restam do que já pagou.
 */
export function Pacotes({
  pacotes,
  servicos,
}: {
  pacotes: PacoteAtivo[];
  servicos: ServicoOpcao[];
}) {
  const [estado, formAction] = useActionState<EstadoPacote, FormData>(
    registrarPacote,
    {}
  );
  const [aberto, setAberto] = useState(false);

  // Controlados: o React 19 limpa campos não-controlados depois da action
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? "");
  const [contratadas, setContratadas] = useState("6");
  const [utilizadas, setUtilizadas] = useState("0");
  const [validade, setValidade] = useState("");

  const mostrarForm = aberto || (pacotes.length === 0 && estado.erro);

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-sans text-[1.05rem] font-semibold">
          <IconeCartao className="h-4 w-4 text-accent" />
          Meus pacotes
        </h2>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {mostrarForm ? "Fechar" : "Registrar pacote"}
        </button>
      </div>

      {pacotes.length > 0 ? (
        <ul className="mb-4 grid gap-3 sm:grid-cols-2">
          {pacotes.map((p) => {
            const restantes = p.sessoesContratadas - p.sessoesUtilizadas;
            const pct = (p.sessoesUtilizadas / p.sessoesContratadas) * 100;

            return (
              <li
                key={p.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <h3 className="font-sans text-[0.95rem] font-semibold">
                    {p.servicoNome}
                  </h3>
                  <span className="text-[0.8rem] text-muted">
                    vence {p.validade}
                  </span>
                </div>

                <p className="mb-2.5 text-[0.86rem]">
                  <strong className="font-semibold text-accent">
                    {restantes}
                  </strong>{" "}
                  {restantes === 1 ? "sessão restante" : "sessões restantes"}
                  <span className="text-muted">
                    {" "}
                    de {p.sessoesContratadas}
                  </span>
                </p>

                <Progress valor={pct} />

                <div className="mt-3.5 flex flex-wrap gap-2">
                  {restantes > 0 ? (
                    <form action={usarSessaoPacote}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-line px-4 py-2 text-[0.78rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                      >
                        Usei uma sessão
                      </button>
                    </form>
                  ) : null}

                  <form action={excluirPacote}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-line px-4 py-2 text-[0.78rem] font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {mostrarForm ? (
        <form
          action={formAction}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <p className="mb-4 text-[0.82rem] leading-relaxed text-muted">
            Comprou um pacote na clínica? Registre aqui para acompanhar quantas
            sessões ainda restam. O controle oficial segue com a recepção.
          </p>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="servicoId" className={ROTULO}>
                Serviço
              </label>
              <select
                id="servicoId"
                name="servicoId"
                value={servicoId}
                onChange={(e) => setServicoId(e.target.value)}
                className={CAMPO}
              >
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sessoesContratadas" className={ROTULO}>
                Sessões
              </label>
              <input
                id="sessoesContratadas"
                name="sessoesContratadas"
                type="number"
                min={2}
                max={60}
                value={contratadas}
                onChange={(e) => setContratadas(e.target.value)}
                className={CAMPO}
              />
            </div>

            <div>
              <label htmlFor="sessoesUtilizadas" className={ROTULO}>
                Já usadas
              </label>
              <input
                id="sessoesUtilizadas"
                name="sessoesUtilizadas"
                type="number"
                min={0}
                value={utilizadas}
                onChange={(e) => setUtilizadas(e.target.value)}
                className={CAMPO}
              />
            </div>

            <div>
              <label htmlFor="validade" className={ROTULO}>
                Vale até
              </label>
              <input
                id="validade"
                name="validade"
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className={CAMPO}
              />
            </div>
          </div>

          {estado.erro ? (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-danger-bg px-3.5 py-2 text-[0.82rem] font-medium text-danger"
            >
              {estado.erro}
            </p>
          ) : null}

          <div className="mt-4">
            <Salvar />
          </div>
        </form>
      ) : null}
    </section>
  );
}
