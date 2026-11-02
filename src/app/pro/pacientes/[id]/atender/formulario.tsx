"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  registrarAtendimento,
  type EstadoAtendimento,
} from "@/app/actions/pro";
import { MapaCorporal } from "@/components/mapa-corporal";

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent";
const ROTULO =
  "mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted";

function Registrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Registrando…" : "Registrar atendimento"}
    </button>
  );
}

type Opcao = { id: string; nome: string };

export function FormularioAtendimento({
  pacienteId,
  sessoes,
  sessaoInicial,
  servicos,
}: {
  pacienteId: string;
  sessoes: { id: string; rotulo: string }[];
  sessaoInicial: string;
  servicos: Opcao[];
}) {
  const [estado, formAction] = useActionState<EstadoAtendimento, FormData>(
    registrarAtendimento,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro de validação apagaria a evolução inteira já escrita
  const [agendamentoId, setAgendamentoId] = useState(sessaoInicial);
  const [servicoId, setServicoId] = useState(servicos.length === 1 ? servicos[0].id : "");
  const [queixa, setQueixa] = useState("");
  const [dor, setDor] = useState("");
  const [conduta, setConduta] = useState("");
  const [evolucao, setEvolucao] = useState("");
  const [orientacoes, setOrientacoes] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="pacienteId" value={pacienteId} />

      <section className="grid gap-5 rounded-3xl border border-line bg-surface p-6 sm:p-7 md:grid-cols-2">
        <div>
          <label htmlFor="agendamentoId" className={ROTULO}>
            Sessão
          </label>
          <select
            id="agendamentoId"
            name="agendamentoId"
            value={agendamentoId}
            onChange={(e) => setAgendamentoId(e.target.value)}
            className={CAMPO}
          >
            {sessoes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.rotulo}
              </option>
            ))}
            <option value="">Atendimento agora (sessão não registrada)</option>
          </select>
        </div>

        {agendamentoId === "" ? (
          <div>
            <label htmlFor="servicoId" className={ROTULO}>
              Serviço realizado
            </label>
            <select
              id="servicoId"
              name="servicoId"
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              className={CAMPO}
            >
              <option value="">Escolha…</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label htmlFor="queixa" className={ROTULO}>
            Queixa do dia{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <textarea
            id="queixa"
            name="queixa"
            rows={2}
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            placeholder="O que a pessoa relatou ao chegar"
            className={`${CAMPO} resize-y`}
          />
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-line bg-surface p-6 sm:p-7 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className={ROTULO}>Onde dói</p>
          <MapaCorporal nome="regioesDor" />
        </div>

        <div>
          <label htmlFor="dor" className={ROTULO}>
            Intensidade da dor{" "}
            <span className="font-normal normal-case tracking-normal">
              (0 a 10)
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, n) => String(n)).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDor(dor === n ? "" : n)}
                aria-pressed={dor === n}
                className={`h-10 w-10 rounded-xl border text-[0.88rem] font-semibold transition-colors ${
                  dor === n
                    ? "border-accent bg-accent text-[#0e241e]"
                    : "border-line bg-sunken hover:border-accent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input type="hidden" name="dor" value={dor} />
          <p className="mt-2 text-[0.76rem] text-muted">
            0 = sem dor · 10 = pior dor imaginável. Toque de novo para limpar.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:p-7">
        <div>
          <label htmlFor="conduta" className={ROTULO}>
            Conduta — o que foi feito
          </label>
          <textarea
            id="conduta"
            name="conduta"
            rows={4}
            value={conduta}
            onChange={(e) => setConduta(e.target.value)}
            placeholder="Técnicas, regiões trabalhadas, ajustes…"
            className={`${CAMPO} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="evolucao" className={ROTULO}>
            Evolução
          </label>
          <textarea
            id="evolucao"
            name="evolucao"
            rows={4}
            value={evolucao}
            onChange={(e) => setEvolucao(e.target.value)}
            placeholder="Como a pessoa respondeu e como está em relação às sessões anteriores"
            className={`${CAMPO} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="orientacoes" className={ROTULO}>
            Orientações{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </label>
          <textarea
            id="orientacoes"
            name="orientacoes"
            rows={3}
            value={orientacoes}
            onChange={(e) => setOrientacoes(e.target.value)}
            placeholder="Exercícios, cuidados em casa, foco da próxima sessão"
            className={`${CAMPO} resize-y`}
          />
        </div>
      </section>

      {estado.erro ? (
        <p
          role="alert"
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Registrar />
        <p className="text-[0.8rem] text-muted">
          Registrar conclui a sessão e soma os pontos do Clube do paciente.
        </p>
      </div>
    </form>
  );
}
