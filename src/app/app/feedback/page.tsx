import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { dataCurta } from "@/lib/format";
import { Card, Pill, SectionTitle, Vazio } from "@/components/ui";
import { FormularioFeedback } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fale com a Direção" };

const ROTULO_TIPO: Record<string, string> = {
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
};

const TOM_STATUS: Record<string, "warning" | "muted" | "success"> = {
  ABERTO: "warning",
  LIDO: "muted",
  RESOLVIDO: "success",
};

const ROTULO_STATUS_FEEDBACK: Record<string, string> = {
  ABERTO: "Aguardando leitura",
  LIDO: "Lido pela direção",
  RESOLVIDO: "Respondido",
};

export default async function FeedbackPage() {
  const paciente = await pacienteDaSessao();

  const enviados = await db.feedback.findMany({
    where: { pacienteId: paciente.id },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Fale com a Direção</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Elogios, sugestões e reclamações chegam direto à direção da clínica.
          Fica tudo registrado aqui, com a resposta.
        </p>
      </header>

      <Card className="mb-9 max-w-3xl p-7 sm:p-8">
        <FormularioFeedback />
      </Card>

      <SectionTitle>Suas mensagens</SectionTitle>

      {enviados.length === 0 ? (
        <Vazio>
          Você ainda não enviou nenhuma mensagem. O que você escrever aparece
          aqui, junto com a resposta da direção.
        </Vazio>
      ) : (
        <ul className="flex max-w-3xl flex-col gap-3.5">
          {enviados.map((f) => (
            <li
              key={f.id}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h2 className="font-sans text-[0.98rem] font-semibold">
                  {f.assunto}
                </h2>
                <Pill tom={TOM_STATUS[f.status] ?? "muted"}>
                  {ROTULO_STATUS_FEEDBACK[f.status] ?? f.status}
                </Pill>
                <span className="text-[0.78rem] text-muted">
                  {ROTULO_TIPO[f.tipo] ?? f.tipo} · {dataCurta(f.criadoEm)}
                </span>
              </div>

              <p className="whitespace-pre-line text-[0.88rem] leading-relaxed text-muted">
                {f.mensagem}
              </p>

              {f.resposta ? (
                <div className="mt-4 rounded-xl border-l-2 border-accent bg-sunken px-4 py-3.5">
                  <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">
                    Resposta da direção
                  </p>
                  <p className="whitespace-pre-line text-[0.88rem] leading-relaxed">
                    {f.resposta}
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
