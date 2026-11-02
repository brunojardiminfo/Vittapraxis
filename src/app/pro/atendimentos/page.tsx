import Link from "next/link";
import { db } from "@/lib/db";
import { profissionalId } from "@/lib/profissional";
import { dataCurta } from "@/lib/format";
import { lerRegioes, rotulosDe } from "@/lib/mapa-corporal";
import { Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meus atendimentos" };

/** Histórico do profissional: tudo que ele registrou, do mais novo ao mais velho. */
export default async function MeusAtendimentosPage() {
  const meuId = await profissionalId();

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [evolucoes, noMes] = await Promise.all([
    db.evolucao.findMany({
      where: { profissionalId: meuId },
      orderBy: { criadoEm: "desc" },
      take: 100,
      include: {
        paciente: { include: { usuario: { select: { nome: true } } } },
        agendamento: { include: { servico: { select: { nome: true } } } },
      },
    }),
    db.evolucao.count({
      where: { profissionalId: meuId, criadoEm: { gte: inicioMes } },
    }),
  ]);

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Meus atendimentos</h1>
        <p className="mt-1 text-sm text-muted">
          {noMes} {noMes === 1 ? "atendimento registrado" : "atendimentos registrados"}{" "}
          neste mês
        </p>
      </header>

      {evolucoes.length === 0 ? (
        <Vazio>
          Nenhum atendimento registrado ainda. Busque um paciente e use
          “Registrar atendimento”.
        </Vazio>
      ) : (
        <ul className="flex flex-col gap-3">
          {evolucoes.map((e) => {
            const regioes = rotulosDe(lerRegioes(e.regioesDor));
            return (
              <li key={e.id}>
                <Link
                  href={`/pro/pacientes/${e.pacienteId}`}
                  className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
                >
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-sans text-[0.98rem] font-semibold">
                      {e.paciente.usuario.nome}
                    </p>
                    <span className="text-[0.8rem] text-muted">
                      {dataCurta(e.agendamento.inicio)} · {e.agendamento.servico.nome}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[0.86rem] leading-relaxed text-muted">
                    {e.evolucao}
                  </p>
                  {e.dor !== null || regioes.length > 0 ? (
                    <p className="mt-2 text-[0.78rem] text-muted">
                      {e.dor !== null ? `Dor ${e.dor}/10` : ""}
                      {e.dor !== null && regioes.length > 0 ? " · " : ""}
                      {regioes.join(", ")}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
