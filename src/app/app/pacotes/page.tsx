import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { dataCurta } from "@/lib/format";
import { Pill, Progress, Stat, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carteira de Pacotes" };

const TOM_STATUS: Record<string, "success" | "muted" | "danger"> = {
  ATIVO: "success",
  CONCLUIDO: "muted",
  EXPIRADO: "danger",
};

const TEXTO_STATUS: Record<string, string> = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
  EXPIRADO: "Expirado",
};

export default async function PacotesPage() {
  const paciente = await pacienteDaSessao();

  const pacotes = await db.pacote.findMany({
    where: { pacienteId: paciente.id },
    orderBy: [{ status: "asc" }, { validade: "asc" }],
    include: {
      servico: true,
      profissional: true,
    },
  });

  const totalRestante = pacotes
    .filter((p) => p.status === "ATIVO")
    .reduce((s, p) => s + (p.sessoesContratadas - p.sessoesUtilizadas), 0);

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Carteira de Pacotes</h1>
        <p className="mt-1 text-sm text-muted">
          {totalRestante > 0
            ? `Você tem ${totalRestante} ${totalRestante === 1 ? "sessão disponível" : "sessões disponíveis"} nos seus planos ativos`
            : "Sessões contratadas, utilizadas e validade"}
        </p>
      </header>

      {pacotes.length === 0 ? (
        <Vazio>Você ainda não contratou nenhum pacote.</Vazio>
      ) : (
        <div className="flex flex-col gap-4">
          {pacotes.map((p) => {
            const restantes = p.sessoesContratadas - p.sessoesUtilizadas;
            const pct = (p.sessoesUtilizadas / p.sessoesContratadas) * 100;
            const concluido = p.status !== "ATIVO";

            return (
              <article
                key={p.id}
                className="rounded-2xl border border-line bg-surface p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[1.05rem]">
                    {p.servico.nome} — {p.sessoesContratadas} sessões
                  </h2>
                  <Pill tom={TOM_STATUS[p.status] ?? "muted"}>
                    {TEXTO_STATUS[p.status] ?? p.status}
                  </Pill>
                </div>

                <div className="mb-4 flex gap-3.5">
                  <Stat valor={p.sessoesUtilizadas} rotulo="Utilizadas" />
                  <Stat valor={restantes} rotulo="Restantes" />
                </div>

                {concluido ? (
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-line"
                    role="presentation"
                  >
                    <div className="h-full w-full rounded-full bg-[var(--text-muted)]" />
                  </div>
                ) : (
                  <Progress valor={pct} />
                )}

                <p className="mt-3.5 text-[0.78rem] text-muted">
                  {p.status === "ATIVO"
                    ? `Válido até ${dataCurta(p.validade)}`
                    : `Encerrado em ${dataCurta(p.validade)}`}
                  {p.profissional?.nome ? ` · ${p.profissional.nome}` : ""}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
