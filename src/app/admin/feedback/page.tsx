import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta } from "@/lib/format";
import { linkWhatsapp } from "@/lib/whatsapp";
import { marcarFeedbackLido } from "@/app/actions/feedback";
import { Pill, Vazio } from "@/components/ui";
import { IconeChat } from "@/components/icones";
import { Resposta } from "./resposta";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feedback" };

const ROTULO_TIPO: Record<string, string> = {
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
};

const TOM_TIPO: Record<string, "success" | "warning" | "danger"> = {
  ELOGIO: "success",
  SUGESTAO: "warning",
  RECLAMACAO: "danger",
};

const ROTULO_STATUS_FEEDBACK: Record<string, string> = {
  ABERTO: "Aberto",
  LIDO: "Lido",
  RESOLVIDO: "Respondido",
};

export default async function AdminFeedbackPage() {
  // Abertos primeiro; dentro de cada grupo, o mais recente no topo
  const mensagens = await db.feedback.findMany({
    orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
    include: {
      paciente: {
        include: { usuario: { select: { nome: true, email: true } } },
      },
    },
  });

  const abertos = mensagens.filter((m) => m.status === "ABERTO");
  const reclamacoesAbertas = abertos.filter((m) => m.tipo === "RECLAMACAO");

  return (
    <>
      <nav className="mb-5">
        <Link
          href="/admin"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Visão geral
        </Link>
      </nav>

      <header className="mb-7">
        <h1 className="text-[1.7rem]">Feedback dos pacientes</h1>
        <p className="mt-1 text-sm text-muted">
          {abertos.length === 0
            ? "Nada aguardando resposta."
            : `${abertos.length} ${abertos.length === 1 ? "mensagem aberta" : "mensagens abertas"}`}
          {reclamacoesAbertas.length > 0
            ? ` · ${reclamacoesAbertas.length} ${
                reclamacoesAbertas.length === 1
                  ? "é reclamação"
                  : "são reclamações"
              }`
            : ""}
        </p>
      </header>

      {mensagens.length === 0 ? (
        <Vazio>
          Nenhum paciente escreveu ainda. As mensagens enviadas em{" "}
          <span className="font-semibold">Fale com a Direção</span> aparecem
          aqui.
        </Vazio>
      ) : (
        <ul className="flex flex-col gap-3">
          {mensagens.map((m) => {
            const zap = linkWhatsapp(
              m.paciente.whatsapp ?? m.paciente.telefone,
              `Olá, ${m.paciente.usuario.nome.split(" ")[0]}! Aqui é da Vitapraxis, sobre a sua mensagem "${m.assunto}".`
            );

            return (
              <li
                key={m.id}
                className={`rounded-2xl border bg-surface p-5 ${
                  m.status === "ABERTO" && m.tipo === "RECLAMACAO"
                    ? "border-danger"
                    : "border-line"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-[18rem] flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h2 className="font-sans text-[1rem] font-semibold">
                        {m.assunto}
                      </h2>
                      <Pill tom={TOM_TIPO[m.tipo] ?? "muted"}>
                        {ROTULO_TIPO[m.tipo] ?? m.tipo}
                      </Pill>
                      <Pill tom={m.status === "RESOLVIDO" ? "success" : "muted"}>
                        {ROTULO_STATUS_FEEDBACK[m.status] ?? m.status}
                      </Pill>
                    </div>

                    <p className="text-[0.82rem] text-muted">
                      {m.paciente.usuario.nome} · {dataCurta(m.criadoEm)}
                    </p>

                    <p className="mt-2.5 whitespace-pre-line rounded-lg bg-sunken px-3.5 py-3 text-[0.88rem] leading-relaxed">
                      {m.mensagem}
                    </p>

                    {m.resposta ? (
                      <div className="mt-3 rounded-xl border-l-2 border-accent px-4 py-2.5">
                        <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">
                          Sua resposta
                        </p>
                        <p className="whitespace-pre-line text-[0.86rem] leading-relaxed text-muted">
                          {m.resposta}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    {zap ? (
                      <a
                        href={zap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                      >
                        <IconeChat className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : (
                      <a
                        href={`mailto:${m.paciente.usuario.email}`}
                        className="rounded-full border border-line px-5 py-2.5 text-[0.82rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                      >
                        E-mail
                      </a>
                    )}

                    {m.status === "ABERTO" ? (
                      <form action={marcarFeedbackLido}>
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                        >
                          Só marcar como lido
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {m.resposta ? null : <Resposta id={m.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
