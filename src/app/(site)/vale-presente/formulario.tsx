"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { criarPedidoVale, type EstadoVale } from "@/app/actions/vale";
import { moeda } from "@/lib/format";
import { CLINICA } from "@/lib/clinica";

export type ServicoOpcao = {
  id: string;
  nome: string;
  duracaoMin: number;
};

const VALORES_SUGERIDOS = [150, 300, 500];

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

export function FormularioVale({ servicos }: { servicos: ServicoOpcao[] }) {
  const [estado, formAction] = useActionState<EstadoVale, FormData>(
    criarPedidoVale,
    {}
  );

  // Controlados porque o React 19 limpa campos não-controlados depois que a
  // action roda — sem isso, um erro de validação apagaria tudo que a pessoa
  // digitou.
  const [tipo, setTipo] = useState<"VALOR" | "SERVICO">("VALOR");
  const [valor, setValor] = useState("150");
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? "");
  const [deNome, setDeNome] = useState("");
  const [deContato, setDeContato] = useState("");
  const [paraNome, setParaNome] = useState("");
  const [mensagem, setMensagem] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {/* Tipo de presente */}
      <fieldset>
        <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Como você quer presentear?
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
              tipo === "VALOR"
                ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            <input
              type="radio"
              name="tipo"
              value="VALOR"
              checked={tipo === "VALOR"}
              onChange={() => setTipo("VALOR")}
              className="mt-1 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-[0.92rem] font-semibold">
                Um valor
              </span>
              <span className="block text-[0.78rem] text-muted">
                Quem recebe escolhe o serviço
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
              tipo === "SERVICO"
                ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            <input
              type="radio"
              name="tipo"
              value="SERVICO"
              checked={tipo === "SERVICO"}
              onChange={() => setTipo("SERVICO")}
              disabled={servicos.length === 0}
              className="mt-1 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-[0.92rem] font-semibold">
                Uma sessão específica
              </span>
              <span className="block text-[0.78rem] text-muted">
                Você escolhe o serviço
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {/* Valor */}
      {tipo === "VALOR" ? (
        <div>
          <label
            htmlFor="valor"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Valor do vale
          </label>
          <div className="mb-2.5 flex flex-wrap gap-2">
            {VALORES_SUGERIDOS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValor(String(v))}
                className={`rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                  valor === String(v)
                    ? "border-accent bg-vp-green text-[var(--on-brand)] dark:bg-vp-gold dark:text-vp-green-deep"
                    : "border-line text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {moeda(v)}
              </button>
            ))}
          </div>
          <input
            id="valor"
            name="valor"
            type="number"
            min={1}
            step="1"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Outro valor"
            className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
          />
        </div>
      ) : (
        <div>
          <label
            htmlFor="servicoId"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Serviço
          </label>
          <select
            id="servicoId"
            name="servicoId"
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
            className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
          >
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quem dá e quem recebe */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="deNome"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Seu nome
          </label>
          <input
            id="deNome"
            name="deNome"
            value={deNome}
            onChange={(e) => setDeNome(e.target.value)}
            placeholder="Quem está presenteando"
            className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
          />
        </div>
        <div>
          <label
            htmlFor="paraNome"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
          >
            Nome de quem recebe
          </label>
          <input
            id="paraNome"
            name="paraNome"
            value={paraNome}
            onChange={(e) => setParaNome(e.target.value)}
            placeholder="Para quem é o presente"
            className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="deContato"
          className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Seu telefone ou e-mail
        </label>
        <input
          id="deContato"
          name="deContato"
          value={deContato}
          onChange={(e) => setDeContato(e.target.value)}
          placeholder="Para a clínica confirmar com você"
          className="w-full rounded-xl border border-line bg-sunken px-4 py-3 text-[0.9rem] outline-none focus:border-accent"
        />
      </div>

      {/* Mensagem */}
      <div>
        <label
          htmlFor="mensagem"
          className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Mensagem no cartão{" "}
          <span className="font-normal normal-case tracking-normal">
            (opcional)
          </span>
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Ex.: Feliz aniversário! Um momento só seu."
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

      <Enviar />

      <p className="text-[0.8rem] leading-relaxed text-muted">
        Ao continuar, abrimos uma conversa no WhatsApp (
        {CLINICA.whatsapp.exibicao}) com os dados já preenchidos — a clínica
        confirma o pagamento e a emissão do vale por lá.
      </p>
    </form>
  );
}
