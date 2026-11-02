"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { cadastrarLead, type EstadoLead } from "@/app/actions/leads";
import { IconeAjuda, IconeCheck } from "@/components/icones";
import { CLINICA } from "@/lib/clinica";

const CAMPO =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.92rem] text-ink outline-none transition-colors focus:border-accent";

const PERIODOS = [
  ["MANHA", "Manhã", "8h às 12h"],
  ["TARDE", "Tarde", "12h às 19h"],
  ["QUALQUER", "Tanto faz", "o que abrir primeiro"],
] as const;

const DIAS = [
  ["SEG", "Seg"],
  ["TER", "Ter"],
  ["QUA", "Qua"],
  ["QUI", "Qui"],
  ["SEX", "Sex"],
  ["SAB", "Sáb"],
] as const;

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-vp-green px-7 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:cursor-not-allowed disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Enviando…" : "Quero agendar minha avaliação"}
    </button>
  );
}

function Campo({
  id,
  rotulo,
  children,
}: {
  id: string;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
      >
        {rotulo}
      </label>
      {children}
    </div>
  );
}

function Legenda({ children }: { children: React.ReactNode }) {
  return (
    <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-wider text-muted">
      {children}
    </legend>
  );
}

export function FormularioContato({
  servicos,
  indicadoPor,
}: {
  servicos: string[];
  indicadoPor?: string;
}) {
  const [estado, formAction] = useActionState<EstadoLead, FormData>(
    cadastrarLead,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro de validação apagaria tudo que a pessoa escreveu.
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  // Vazio significa "ainda não sei", que é resposta legítima de quem nunca veio
  const [interesse, setInteresse] = useState("");
  const [periodo, setPeriodo] = useState<string>("QUALQUER");
  const [dias, setDias] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState("");

  function alternarDia(valor: string) {
    setDias((atual) =>
      atual.includes(valor)
        ? atual.filter((d) => d !== valor)
        : [...atual, valor]
    );
  }

  if (estado.ok) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
          <IconeCheck className="h-6 w-6 text-success" />
        </span>
        <h2 className="mb-2.5 text-[1.4rem]">Recebemos seu contato</h2>
        <p className="mx-auto max-w-sm text-[0.92rem] text-muted">
          Nossa recepção vai falar com você em breve para entender seu caso e
          encontrar o melhor horário.
        </p>
        <a
          href={CLINICA.whatsapp.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-block rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          Prefiro falar agora no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-line bg-surface p-7 sm:p-9"
    >
      {indicadoPor ? (
        <input type="hidden" name="indicadoPor" value={indicadoPor} />
      ) : null}

      <h2 className="mb-1.5 text-[1.35rem]">Sua primeira visita</h2>
      <p className="mb-7 text-[0.9rem] leading-relaxed text-muted">
        Tudo começa por uma avaliação: a equipe escuta seu caso e monta o plano
        junto com você. Conte suas preferências e a recepção fecha o horário.
      </p>

      {indicadoPor ? (
        <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-success-bg px-4 py-3 text-[0.86rem] font-medium text-success">
          <IconeCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Você foi indicado por <strong>{indicadoPor}</strong> — vamos aplicar o
          benefício do Clube.
        </p>
      ) : null}

      <div className="flex flex-col gap-7">
        {/* Serviço */}
        <fieldset>
          <Legenda>O que você procura?</Legenda>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {/* Primeira opção de propósito: quem nunca veio raramente sabe
                o nome do serviço, e obrigá-lo a escolher trava o formulário */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors sm:col-span-2 ${
                interesse === ""
                  ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                  : "border-line hover:border-accent"
              }`}
            >
              <input
                type="radio"
                name="interesse"
                value=""
                checked={interesse === ""}
                onChange={() => setInteresse("")}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-[0.92rem] font-semibold">
                  Ainda não sei — quero orientação
                </span>
                <span className="block text-[0.78rem] text-muted">
                  A avaliação define o caminho certo
                </span>
              </span>
            </label>

            {servicos.map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  interesse === s
                    ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                    : "border-line hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="interesse"
                  value={s}
                  checked={interesse === s}
                  onChange={() => setInteresse(s)}
                  className="accent-[var(--accent)]"
                />
                <span className="text-[0.9rem] font-semibold">{s}</span>
              </label>
            ))}
          </div>

          <Link
            href="/especialidades"
            className="mt-3 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-accent hover:underline"
          >
            <IconeAjuda className="h-4 w-4" />
            Ver o que cada especialidade trata
          </Link>
        </fieldset>

        {/* Período */}
        <fieldset>
          <Legenda>Melhor período</Legenda>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PERIODOS.map(([valor, titulo, ajuda]) => (
              <label
                key={valor}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  periodo === valor
                    ? "border-accent bg-[color-mix(in_srgb,var(--color-vp-gold)_10%,var(--surface))]"
                    : "border-line hover:border-accent"
                }`}
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
                  <span className="block text-[0.76rem] text-muted">
                    {ajuda}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Dias */}
        <fieldset>
          <Legenda>
            Dias que funcionam{" "}
            <span className="font-normal normal-case tracking-normal">
              (opcional)
            </span>
          </Legenda>
          <div className="flex flex-wrap gap-2">
            {DIAS.map(([valor, rotulo]) => (
              <label
                key={valor}
                className={`cursor-pointer rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                  dias.includes(valor)
                    ? "border-accent bg-vp-green text-[var(--on-brand)] dark:bg-vp-gold dark:text-vp-green-deep"
                    : "border-line text-muted hover:border-accent"
                }`}
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

        {/* Contato */}
        <div className="flex flex-col gap-4">
          <Campo id="nome" rotulo="Nome completo">
            <input
              id="nome"
              name="nome"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={CAMPO}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="email" rotulo="E-mail">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={CAMPO}
              />
            </Campo>
            <Campo id="telefone" rotulo="Telefone / WhatsApp">
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="(51) 90000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className={CAMPO}
              />
            </Campo>
          </div>

          <Campo id="mensagem" rotulo="Conte um pouco do seu caso (opcional)">
            <textarea
              id="mensagem"
              name="mensagem"
              rows={4}
              maxLength={600}
              placeholder="Ex.: dor lombar há alguns meses, piora quando fico muito tempo sentado."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className={`${CAMPO} resize-y`}
            />
          </Campo>
        </div>

        {estado.erro ? (
          <p
            role="alert"
            className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
          >
            {estado.erro}
          </p>
        ) : null}

        <div>
          <Enviar />
          <p className="mt-3 text-center text-[0.82rem] text-muted">
            Prefere resolver agora?{" "}
            <a
              href={CLINICA.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Fale no WhatsApp
            </a>
          </p>
        </div>

        <p className="text-[0.76rem] leading-relaxed text-muted">
          Seus dados são usados apenas para este contato e tratados conforme a
          Lei Geral de Proteção de Dados.
        </p>
      </div>
    </form>
  );
}
