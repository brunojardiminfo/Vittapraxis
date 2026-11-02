import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { dataCurta, hora } from "@/lib/format";
import { WizardBemEstar } from "./wizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Índice de Bem-Estar" };

export default async function BemEstarPage() {
  const paciente = await pacienteDaSessao();

  const proximo = await db.agendamento.findFirst({
    where: {
      pacienteId: paciente.id,
      inicio: { gte: new Date() },
      status: { in: ["AGENDADO", "CONFIRMADO"] },
    },
    orderBy: { inicio: "asc" },
    include: {
      servico: { select: { nome: true } },
      profissional: true,
    },
  });

  const descricaoSessao = proximo
    ? `${dataCurta(proximo.inicio)} às ${hora(proximo.inicio)}`
    : null;

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Índice de Bem-Estar</h1>
        <p className="mt-1 text-sm text-muted">
          Cinco perguntas rápidas sobre humor, sono, hidratação, dor e
          exercício
        </p>
      </header>

      {proximo ? (
        <div className="mb-7 rounded-2xl border border-line bg-sunken px-6 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">
            Antes da sua próxima sessão
          </p>
          <p className="mt-1.5 text-[0.95rem]">
            <span className="font-semibold">{proximo.servico.nome}</span> com{" "}
            {proximo.profissional.nome} — {descricaoSessao}
          </p>
          <p className="mt-1.5 text-[0.85rem] text-muted">
            Suas respostas chegam ao profissional antes de você entrar na sala,
            para que o atendimento seja ajustado ao seu momento.
          </p>
        </div>
      ) : null}

      <WizardBemEstar proximaSessao={descricaoSessao} />
    </>
  );
}
