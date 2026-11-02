"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { salvarServico, type EstadoServico } from "@/app/actions/servicos";

export type ServicoEditavel = {
  id: string;
  nome: string;
  categoria: string;
  duracaoMin: number;
  precoAvulso: number;
  precoEmPlano: number | null;
  pontos: number | null;
  ativo: boolean;
};

/** Number → string do jeito que a pessoa digita: "280,5" e não "280.5". */
function paraCampo(v: number | null) {
  return v === null ? "" : String(v).replace(".", ",");
}

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar"}
    </button>
  );
}

export function FormularioServico({
  servico,
  pontosPadrao,
}: {
  servico: ServicoEditavel;
  pontosPadrao: number;
}) {
  const [estado, formAction] = useActionState<EstadoServico, FormData>(
    salvarServico,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro de validação apagaria o que a pessoa digitou.
  const [duracao, setDuracao] = useState(String(servico.duracaoMin));
  const [avulso, setAvulso] = useState(paraCampo(servico.precoAvulso));
  const [plano, setPlano] = useState(paraCampo(servico.precoEmPlano));
  const [pontos, setPontos] = useState(paraCampo(servico.pontos));
  const [ativo, setAtivo] = useState(servico.ativo);

  const campo =
    "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-[0.88rem] outline-none focus:border-accent";
  const rotulo =
    "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted";

  return (
    <form
      action={formAction}
      className={`rounded-2xl border bg-surface p-5 ${
        ativo ? "border-line" : "border-dashed border-line opacity-70"
      }`}
    >
      <input type="hidden" name="id" value={servico.id} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sans text-[1rem] font-semibold">{servico.nome}</h2>
          <p className="text-[0.76rem] text-muted">{servico.categoria}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[0.8rem] font-semibold">
          <input
            type="checkbox"
            name="ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          {ativo ? "No catálogo" : "Fora do catálogo"}
        </label>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor={`d-${servico.id}`} className={rotulo}>
            Duração (min)
          </label>
          <input
            id={`d-${servico.id}`}
            name="duracaoMin"
            type="number"
            min={5}
            max={480}
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`a-${servico.id}`} className={rotulo}>
            Sessão avulsa (R$)
          </label>
          <input
            id={`a-${servico.id}`}
            name="precoAvulso"
            inputMode="decimal"
            value={avulso}
            onChange={(e) => setAvulso(e.target.value)}
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`p-${servico.id}`} className={rotulo}>
            Sessão em pacote (R$)
          </label>
          <input
            id={`p-${servico.id}`}
            name="precoEmPlano"
            inputMode="decimal"
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
            placeholder="não vende em pacote"
            className={campo}
          />
        </div>

        <div>
          <label htmlFor={`pt-${servico.id}`} className={rotulo}>
            Pontos do Clube
          </label>
          <input
            id={`pt-${servico.id}`}
            name="pontos"
            type="number"
            min={0}
            value={pontos}
            onChange={(e) => setPontos(e.target.value)}
            placeholder={`padrão: ${pontosPadrao}`}
            className={campo}
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

      {estado.ok ? (
        <p
          role="status"
          className="mt-3 rounded-lg bg-success-bg px-3.5 py-2 text-[0.82rem] font-medium text-success"
        >
          Salvo. O site e o portal já mostram os novos dados.
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <Salvar />
        <p className="text-[0.76rem] text-muted">
          Pontos em branco usa o padrão do Clube ({pontosPadrao} por sessão).
        </p>
      </div>
    </form>
  );
}
