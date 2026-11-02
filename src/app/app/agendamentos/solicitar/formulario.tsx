"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { criarPedido, type EstadoPedido } from "@/app/actions/pedidos";
// Valores e duração saíram do portal a pedido da clínica
import { CLINICA } from "@/lib/clinica";

export type ServicoOpcao = {
  id: string;
  nome: string;
  duracaoMin: number;
  precoAvulso: number;
  precoEmPlano: number | null;
  profissionais: { id: string; nome: string }[];
};

const DIAS = [
  ["SEG", "Seg"],
  ["TER", "Ter"],
  ["QUA", "Qua"],
  ["QUI", "Qui"],
  ["SEX", "Sex"],
  ["SAB", "Sáb"],
] as const;

const PERIODOS = [
  ["MANHA", "Manhã", "8h às 12h"],
  ["TARDE", "Tarde", "12h às 19h"],
  ["QUALQUER", "Tanto faz", "o que abrir primeiro"],
] as const;

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Abrindo WhatsApp…" : "Continuar no WhatsApp"}
    </button>
  );
}

export function FormularioPedido({
  servicos,
  servicoInicial,
}: {
  servicos: ServicoOpcao[];
  servicoInicial?: string;
}) {
  const [estado, formAction] = useActionState<EstadoPedido, FormData>(
    criarPedido,
    {}
  );

  const [servicoId, setServicoId] = useState(
    servicoInicial && servicos.some((s) => s.id === servicoInicial)
      ? servicoInicial
      : (servicos[0]?.id ?? "")
  );

  // Controlados porque o React 19 limpa campos não-controlados depois que a
  // action roda — sem isso, um erro de validação apagaria tudo que o paciente
  // preencheu.
  const [profissionalId, setProfissionalId] = useState("");
  const [periodo, setPeriodo] = useState<string>(PERIODOS[0][0]);
  const [dias, setDias] = useState<string[]>([]);
  const [observacao, setObservacao] = useState("");

  const servico = servicos.find((s) => s.id === servicoId);

  function trocarServico(id: string) {
    setServicoId(id);
    // A lista de profissionais muda junto, então a preferência anterior
    // deixaria de fazer sentido
    setProfissionalId("");
  }

  function alternarDia(valor: string) {
    setDias((atual) =>
      atual.includes(valor)
        ? atual.filter((d) => d !== valor)
        : [...atual, valor]
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {/* Serviço */}
      <fieldset>
        <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Qual serviço você precisa?
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {servicos.map((s) => {
            const escolhido = s.id === servicoId;
            return (
              <label
                key={s.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  escolhido
                    ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                    : "border-line bg-surface hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="servicoId"
                  value={s.id}
                  checked={escolhido}
                  onChange={() => trocarServico(s.id)}
                  className="mt-1 accent-[var(--accent)]"
                />
                <span>
                  <span className="block text-[0.92rem] font-semibold">
                    {s.nome}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Profissional */}
      <div>
        <label
          htmlFor="profissionalId"
          className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Prefere algum profissional?
        </label>
        <select
          id="profissionalId"
          name="profissionalId"
          value={profissionalId}
          onChange={(e) => setProfissionalId(e.target.value)}
          className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
        >
          <option value="">Sem preferência</option>
          {servico?.profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Período */}
      <fieldset>
        <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Melhor período
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {PERIODOS.map(([valor, titulo, ajuda]) => (
            <label
              key={valor}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent has-checked:border-accent has-checked:bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
            >
              <input
                type="radio"
                name="periodo"
                value={valor}
                checked={periodo === valor}
                onChange={() => setPeriodo(valor)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-[0.9rem] font-semibold">
                  {titulo}
                </span>
                <span className="block text-[0.76rem] text-muted">{ajuda}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Dias */}
      <fieldset>
        <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Dias que funcionam para você{" "}
          <span className="font-normal normal-case tracking-normal">
            (opcional)
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {DIAS.map(([valor, rotulo]) => (
            <label
              key={valor}
              className="cursor-pointer rounded-full border border-line bg-surface px-4 py-2 text-[0.82rem] font-semibold text-muted transition-colors hover:border-accent has-checked:border-accent has-checked:bg-vp-green has-checked:text-[var(--on-brand)] dark:has-checked:bg-vp-gold dark:has-checked:text-vp-green-deep"
            >
              <input
                type="checkbox"
                name="dias"
                value={valor}
                checked={dias.includes(valor)}
                onChange={() => alternarDia(valor)}
                className="sr-only"
              />
              {rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Observação */}
      <div>
        <label
          htmlFor="observacao"
          className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Algo que a clínica deva saber?{" "}
          <span className="font-normal normal-case tracking-normal">
            (opcional)
          </span>
        </label>
        <textarea
          id="observacao"
          name="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ex.: só consigo depois das 17h, ou a dor no ombro voltou."
          className="w-full resize-y rounded-xl border border-line bg-sunken p-4 text-[0.9rem] outline-none focus:border-accent"
        />
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Enviar />
        <Link
          href="/app/agendamentos"
          className="rounded-full border border-line px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </Link>
      </div>

      <p className="text-[0.8rem] leading-relaxed text-muted">
        Ao continuar, abrimos uma conversa no WhatsApp ({CLINICA.whatsapp.exibicao}
        ) com sua mensagem já escrita — é só enviar. A clínica confirma a data
        por lá.
      </p>
    </form>
  );
}
