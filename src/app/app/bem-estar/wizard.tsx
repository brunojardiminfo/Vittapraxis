"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  registrarBemEstar,
  type EstadoBemEstar,
} from "@/app/actions/bem-estar";
import { IconeCheck } from "@/components/icones";

type Pergunta = {
  campo: "humor" | "sono" | "hidratacao" | "dor" | "exercitou";
  titulo: string;
  ajuda: string;
  opcoes: { rotulo: string; valor: number }[];
};

const PERGUNTAS: Pergunta[] = [
  {
    campo: "humor",
    titulo: "Como está seu humor hoje?",
    ajuda: "Considere as últimas 48 horas.",
    opcoes: [
      { rotulo: "Muito baixo", valor: 1 },
      { rotulo: "Baixo", valor: 2 },
      { rotulo: "Neutro", valor: 3 },
      { rotulo: "Bom", valor: 4 },
      { rotulo: "Excelente", valor: 5 },
    ],
  },
  {
    campo: "sono",
    titulo: "Como você avalia seu sono?",
    ajuda: "Qualidade e duração das últimas noites.",
    opcoes: [
      { rotulo: "Muito ruim", valor: 1 },
      { rotulo: "Ruim", valor: 2 },
      { rotulo: "Regular", valor: 3 },
      { rotulo: "Bom", valor: 4 },
      { rotulo: "Excelente", valor: 5 },
    ],
  },
  {
    campo: "hidratacao",
    titulo: "Como está sua hidratação hoje?",
    ajuda: "Quanto de água você bebeu até agora.",
    opcoes: [
      { rotulo: "Quase nada", valor: 1 },
      { rotulo: "Pouca", valor: 2 },
      { rotulo: "Razoável", valor: 3 },
      { rotulo: "Boa", valor: 4 },
      { rotulo: "Bebi bastante", valor: 5 },
    ],
  },
  {
    campo: "dor",
    titulo: "Qual seu nível de dor agora?",
    ajuda: "0 é ausência de dor, 10 é a pior dor que você já sentiu.",
    opcoes: [
      { rotulo: "0 – 2", valor: 1 },
      { rotulo: "3 – 4", valor: 4 },
      { rotulo: "5 – 6", valor: 6 },
      { rotulo: "7 – 8", valor: 8 },
      { rotulo: "9 – 10", valor: 10 },
    ],
  },
  {
    campo: "exercitou",
    titulo: "Você já se exercitou hoje?",
    ajuda: "Vale caminhada, alongamento ou treino.",
    opcoes: [
      { rotulo: "Ainda não", valor: 0 },
      { rotulo: "Sim", valor: 1 },
    ],
  },
];

function BotaoEnviar({ desabilitado }: { desabilitado: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || desabilitado}
      className="rounded-full bg-vp-green px-7 py-3 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-50 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Enviando…" : "Enviar respostas"}
    </button>
  );
}

export function WizardBemEstar({
  proximaSessao,
}: {
  proximaSessao: string | null;
}) {
  const [estado, formAction] = useActionState<EstadoBemEstar, FormData>(
    registrarBemEstar,
    {}
  );
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  // Controlado porque o React 19 limpa campos não-controlados após a action
  const [observacao, setObservacao] = useState("");

  const total = PERGUNTAS.length;
  const concluido = estado.ok === true;
  const passoAtual = PERGUNTAS[passo];
  const respondida = passoAtual
    ? respostas[passoAtual.campo] !== undefined
    : true;
  const todasRespondidas = PERGUNTAS.every(
    (p) => respostas[p.campo] !== undefined
  );

  if (concluido) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-12 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <IconeCheck className="h-6 w-6 text-success" />
        </span>
        <h2 className="mb-2.5 text-[1.5rem]">Respostas enviadas</h2>
        <p className="text-[0.92rem] text-muted">
          {proximaSessao
            ? `Sua equipe verá suas respostas antes da sessão de ${proximaSessao}.`
            : "Sua equipe já pode consultar suas respostas."}
        </p>
        <a
          href="/app/evolucao"
          className="mt-7 inline-block rounded-full border border-line px-6 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Ver minha evolução
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-9 text-center sm:p-12"
    >
      {/* As respostas dos passos anteriores viajam como hidden */}
      {PERGUNTAS.map((p) =>
        respostas[p.campo] !== undefined ? (
          <input
            key={p.campo}
            type="hidden"
            name={p.campo}
            value={respostas[p.campo]}
          />
        ) : null
      )}

      <div className="mb-9 flex justify-center gap-2" aria-hidden>
        {PERGUNTAS.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === passo
                ? "w-6 bg-accent"
                : i < passo
                  ? "w-2 bg-accent/50"
                  : "w-2 bg-line"
            }`}
          />
        ))}
      </div>

      <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">
        Pergunta {passo + 1} de {total}
      </p>
      <h2 className="mb-2.5 text-[1.5rem]">{passoAtual.titulo}</h2>
      <p className="mb-8 text-[0.92rem] text-muted">{passoAtual.ajuda}</p>

      <div
        role="radiogroup"
        aria-label={passoAtual.titulo}
        className="mb-9 flex flex-wrap justify-center gap-2"
      >
        {passoAtual.opcoes.map((o) => {
          const selecionada = respostas[passoAtual.campo] === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={selecionada}
              onClick={() =>
                setRespostas((r) => ({ ...r, [passoAtual.campo]: o.valor }))
              }
              className={`min-w-[5rem] flex-1 rounded-xl border px-2 py-4 text-[0.8rem] font-semibold transition-colors ${
                selecionada
                  ? "border-vp-green bg-vp-green text-[var(--on-brand)] dark:border-vp-gold dark:bg-vp-gold dark:text-vp-green-deep"
                  : "border-line bg-sunken text-muted hover:border-accent"
              }`}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>

      {passo === total - 1 ? (
        <div className="mb-7">
          <label
            htmlFor="observacao"
            className="mb-2 block text-left text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
          >
            Quer contar mais alguma coisa? (opcional)
          </label>
          <textarea
            id="observacao"
            name="observacao"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ex.: a dor piora quando fico muito tempo sentada."
            className="w-full resize-y rounded-xl border border-line bg-sunken p-3.5 text-left text-[0.88rem] outline-none focus:border-accent"
          />
        </div>
      ) : null}

      {estado.erro ? (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="flex justify-center gap-3">
        {passo > 0 ? (
          <button
            type="button"
            onClick={() => setPasso((p) => p - 1)}
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            Voltar
          </button>
        ) : null}

        {passo < total - 1 ? (
          <button
            type="button"
            disabled={!respondida}
            onClick={() => setPasso((p) => p + 1)}
            className="rounded-full bg-vp-green px-7 py-3 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-50 dark:bg-vp-gold dark:text-vp-green-deep"
          >
            Continuar
          </button>
        ) : (
          <BotaoEnviar desabilitado={!todasRespondidas} />
        )}
      </div>
    </form>
  );
}
