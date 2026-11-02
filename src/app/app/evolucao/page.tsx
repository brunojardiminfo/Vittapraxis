import Link from "next/link";
import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import {
  ROTULO_HUMOR,
  ROTULO_SONO,
  calcularIndice,
  dataCurta,
  faixaDor,
} from "@/lib/format";
import { BotaoLink, Card, Pill, SectionTitle, Stat, Vazio } from "@/components/ui";
import { GraficoEvolucao } from "@/components/grafico-evolucao";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu Bem-Estar" };

export default async function BemEstarPage() {
  const paciente = await pacienteDaSessao();

  const [indices, sessoesConcluidas] = await Promise.all([
    db.indiceBemEstar.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { respondidoEm: "asc" },
    }),
    db.agendamento.count({
      where: { pacienteId: paciente.id, status: "CONCLUIDO" },
    }),
  ]);

  const pontos = indices.map((i) => ({
    data: i.respondidoEm,
    humor: i.humor,
    sono: i.sono,
    dor: i.dor,
  }));

  const primeiro = indices[0];
  const ultimo = indices[indices.length - 1];
  const indicePrimeiro = primeiro
    ? calcularIndice(primeiro.humor, primeiro.sono, primeiro.dor)
    : null;
  const indiceUltimo = ultimo
    ? calcularIndice(ultimo.humor, ultimo.sono, ultimo.dor)
    : null;

  const ganho =
    indicePrimeiro !== null && indiceUltimo !== null
      ? indiceUltimo - indicePrimeiro
      : null;

  return (
    <>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.9rem]">Meu Bem-Estar</h1>
          <p className="mt-1 text-sm text-muted">
            Como seu humor, sono e dor evoluíram ao longo do acompanhamento
          </p>
        </div>
        <BotaoLink href="/app/bem-estar" tamanho="sm">
          Nova avaliação
        </BotaoLink>
      </header>

      {indices.length === 0 ? (
        <Vazio>
          Você ainda não respondeu nenhuma avaliação.{" "}
          <Link
            href="/app/bem-estar"
            className="font-semibold text-accent hover:underline"
          >
            Responder a primeira
          </Link>
        </Vazio>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3.5">
            <Stat
              valor={
                indiceUltimo !== null
                  ? indiceUltimo.toFixed(1).replace(".", ",")
                  : "—"
              }
              rotulo="Índice atual"
            />
            <Stat
              valor={
                ganho !== null
                  ? `${ganho >= 0 ? "+" : ""}${ganho.toFixed(1).replace(".", ",")}`
                  : "—"
              }
              rotulo="Desde o início"
            />
            <Stat valor={sessoesConcluidas} rotulo="Sessões concluídas" />
            <Stat valor={indices.length} rotulo="Avaliações" />
          </div>

          <Card className="mb-9 p-7">
            <GraficoEvolucao pontos={pontos} />
          </Card>

          <section>
            <SectionTitle>Histórico de Avaliações</SectionTitle>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[520px] border-collapse text-[0.86rem]">
                <thead>
                  <tr className="bg-sunken text-left">
                    {["Data", "Humor", "Sono", "Dor", "Índice"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...indices].reverse().map((i) => {
                    const f = faixaDor(i.dor);
                    return (
                      <tr key={i.id} className="border-t border-line bg-surface">
                        <td className="px-4 py-3">{dataCurta(i.respondidoEm)}</td>
                        <td className="px-4 py-3">{ROTULO_HUMOR[i.humor]}</td>
                        <td className="px-4 py-3">{ROTULO_SONO[i.sono]}</td>
                        <td className="px-4 py-3">
                          <Pill tom={f.tom}>
                            {i.dor}/10 · {f.rotulo}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 font-semibold tabular-nums">
                          {calcularIndice(i.humor, i.sono, i.dor)
                            .toFixed(1)
                            .replace(".", ",")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
