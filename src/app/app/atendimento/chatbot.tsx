"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type Mensagem = { de: "bot" | "eu"; texto: string; link?: { href: string; texto: string } };

/**
 * Triagem inicial por palavra-chave. A intenção aqui é encaminhar para o
 * profissional certo — não dar orientação clínica, que é papel da consulta.
 */
const REGRAS: { termos: string[]; resposta: Mensagem }[] = [
  {
    termos: ["ombro", "costas", "coluna", "lombar", "cervical", "postura"],
    resposta: {
      de: "bot",
      texto:
        "Dores de coluna e postura costumam ser avaliadas pela Quiropraxia. Se a queixa vem de treino ou esforço repetitivo, a Liberação Miofascial também é indicada.",
      link: { href: "/app/servicos", texto: "Ver Quiropraxia e Liberação Miofascial" },
    },
  },
  {
    termos: ["mandibula", "mandíbula", "atm", "bruxismo", "mastigar", "estalo"],
    resposta: {
      de: "bot",
      texto:
        "Esses sinais apontam para disfunção da articulação temporomandibular. A Marcia Valiente atende Fisioterapia ATM.",
      link: { href: "/app/equipe", texto: "Conhecer a Marcia" },
    },
  },
  {
    termos: ["ansiedade", "estresse", "sono", "dormir", "insonia", "insônia"],
    resposta: {
      de: "bot",
      texto:
        "Para sono e ansiedade, Acupuntura e Massoterapia costumam trazer bons resultados. Vale também responder o Índice de Bem-Estar para sua equipe acompanhar.",
      link: { href: "/app/bem-estar", texto: "Responder Índice de Bem-Estar" },
    },
  },
  {
    termos: ["alimentacao", "alimentação", "dieta", "peso", "nutricao", "nutrição", "comer"],
    resposta: {
      de: "bot",
      texto:
        "A Juliana Deitos monta planos alimentares individualizados, considerando sua rotina e seus objetivos.",
      link: { href: "/app/servicos", texto: "Ver Nutrição" },
    },
  },
  {
    termos: ["treino", "atleta", "corrida", "muscular", "lesao", "lesão", "recuperacao", "recuperação"],
    resposta: {
      de: "bot",
      texto:
        "O Evandro Sajdak é especialista em Liberação Miofascial esportiva — melhora desempenho e acelera a recuperação.",
      link: { href: "/app/servicos", texto: "Ver Liberação Miofascial" },
    },
  },
  {
    termos: ["agendar", "horario", "horário", "marcar", "remarcar", "reagendar", "cancelar"],
    resposta: {
      de: "bot",
      texto:
        "Você resolve tudo isso na aba Agendamentos: confirmar, reagendar, cancelar e fazer check-in.",
      link: { href: "/app/agendamentos", texto: "Ir para Agendamentos" },
    },
  },
  {
    termos: ["pacote", "sessoes", "sessões", "quantas", "saldo", "cashback", "pontos"],
    resposta: {
      de: "bot",
      texto:
        "Seu saldo de sessões está na Carteira de Pacotes, e cashback e pontos ficam no Clube de Benefícios.",
      link: { href: "/app/pacotes", texto: "Ver Carteira de Pacotes" },
    },
  },
];

const PADRAO: Mensagem = {
  de: "bot",
  texto:
    "Não tenho certeza sobre esse assunto. Posso te encaminhar para a recepção pelo WhatsApp, ou você pode consultar o catálogo de serviços.",
  link: { href: "/app/servicos", texto: "Ver catálogo de serviços" },
};

const SUGESTOES = [
  "Estou com dor no ombro",
  "Não durmo bem",
  "Quero remarcar minha sessão",
  "Quantas sessões me restam?",
];

function normalizar(s: string) {
  // NFD separa o acento da letra; o range remove as marcas diacríticas
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function responder(pergunta: string): Mensagem {
  const texto = normalizar(pergunta);
  const regra = REGRAS.find((r) =>
    r.termos.some((t) => texto.includes(normalizar(t)))
  );
  return regra?.resposta ?? PADRAO;
}

export function Chatbot({ primeiroNome }: { primeiroNome: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      de: "bot",
      texto: `Olá, ${primeiroNome}! Me conte o que está sentindo ou o que precisa resolver, e eu te direciono para o lugar certo.`,
    },
  ]);
  const [texto, setTexto] = useState("");
  const fim = useRef<HTMLDivElement>(null);

  function enviar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa) return;

    setMensagens((m) => [...m, { de: "eu", texto: limpa }, responder(limpa)]);
    setTexto("");
    // Rola para a última mensagem depois que o React pintar
    requestAnimationFrame(() =>
      fim.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans text-[0.92rem] font-semibold">
          Assistente Vitapraxis
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-[0.72rem] font-bold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Online
        </span>
      </div>

      <div className="mb-4 flex max-h-80 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.de === "eu" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[0.86rem] ${
                m.de === "eu"
                  ? "bg-vp-green text-[var(--on-brand)] dark:bg-vp-gold dark:text-vp-green-deep"
                  : "bg-sunken"
              }`}
            >
              {m.texto}
              {m.link ? (
                <Link
                  href={m.link.href}
                  className="mt-2 block font-semibold text-accent hover:underline"
                >
                  {m.link.texto} →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={fim} />
      </div>

      {mensagens.length === 1 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => enviar(s)}
              className="rounded-full border border-line px-3 py-1.5 text-[0.76rem] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="flex gap-2"
      >
        <label htmlFor="chat" className="sr-only">
          Escreva sua dúvida
        </label>
        <input
          id="chat"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva sua dúvida…"
          className="flex-1 rounded-full border border-line bg-sunken px-4 py-2.5 text-[0.86rem] outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
        >
          Enviar
        </button>
      </form>

      <p className="mt-3 text-[0.72rem] leading-relaxed text-muted">
        Esta triagem é apenas um direcionamento inicial e não substitui a
        avaliação de um profissional.
      </p>
    </div>
  );
}
