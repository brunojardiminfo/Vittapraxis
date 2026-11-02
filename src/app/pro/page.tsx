import Link from "next/link";
import { db } from "@/lib/db";
import { profissionalId } from "@/lib/profissional";
import { dataCurta, dataLonga, hora, haQuantoTempo } from "@/lib/format";
import { Card, CardHead, Pill, Vazio } from "@/components/ui";
import { BuscaPaciente } from "./busca";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal do Profissional" };

export default async function ProInicioPage({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string }>;
}) {
  const { senha } = await searchParams;
  const meuId = await profissionalId();

  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(inicioDia.getTime() + 86_400_000 - 1);

  const [pro, hoje, semEvolucao, recentes] = await Promise.all([
    db.profissional.findUnique({
      where: { id: meuId },
      select: { nome: true },
    }),
    // Agenda do dia: o que os pacientes registraram com este profissional
    db.agendamento.findMany({
      where: {
        profissionalId: meuId,
        inicio: { gte: inicioDia, lte: fimDia },
        status: { not: "CANCELADO" },
      },
      orderBy: { inicio: "asc" },
      include: {
        servico: { select: { nome: true } },
        evolucao: { select: { id: true } },
        paciente: { include: { usuario: { select: { nome: true } } } },
      },
    }),
    // Sessões que já passaram e ainda não têm evolução: o que ficou para trás
    db.agendamento.findMany({
      where: {
        profissionalId: meuId,
        inicio: { lt: inicioDia },
        status: { not: "CANCELADO" },
        evolucao: null,
      },
      orderBy: { inicio: "desc" },
      take: 10,
      include: {
        servico: { select: { nome: true } },
        paciente: { include: { usuario: { select: { nome: true } } } },
      },
    }),
    db.evolucao.findMany({
      where: { profissionalId: meuId },
      orderBy: { criadoEm: "desc" },
      take: 6,
      include: {
        paciente: { include: { usuario: { select: { nome: true } } } },
        agendamento: { include: { servico: { select: { nome: true } } } },
      },
    }),
  ]);

  const primeiroNome = pro?.nome.split(" ")[0] ?? "";

  return (
    <>
      <header className="mb-7">
        <p className="text-[0.82rem] capitalize text-muted">
          {dataLonga(new Date())}
        </p>
        <h1 className="mt-1 text-[1.9rem]">Olá, {primeiroNome}</h1>
      </header>

      {senha === "ok" ? (
        <p
          role="status"
          className="mb-6 rounded-2xl bg-success-bg px-5 py-4 text-[0.86rem] font-medium text-success"
        >
          Senha criada. A partir de agora, entre com ela.
        </p>
      ) : null}

      <div className="mb-8">
        <BuscaPaciente />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <Card className="p-6">
          <CardHead
            titulo="Agenda de hoje"
            acao={
              <span className="text-[0.78rem] text-muted">
                {hoje.length} {hoje.length === 1 ? "sessão" : "sessões"}
              </span>
            }
          />
          {hoje.length === 0 ? (
            <Vazio>
              Nenhuma sessão registrada para hoje. Para atender alguém, busque
              o paciente acima.
            </Vazio>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {hoje.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sunken px-4 py-3"
                >
                  <div>
                    <p className="text-[0.92rem] font-semibold">
                      {hora(a.inicio)} · {a.paciente.usuario.nome}
                    </p>
                    <p className="text-[0.8rem] text-muted">{a.servico.nome}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/pro/pacientes/${a.pacienteId}`}
                      className="rounded-full border border-line px-4 py-2 text-[0.78rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      Ficha
                    </Link>
                    {a.evolucao ? (
                      <Pill tom="success">Evolução registrada</Pill>
                    ) : (
                      <Link
                        href={`/pro/pacientes/${a.pacienteId}/atender?agendamento=${a.id}`}
                        className="rounded-full bg-vp-green px-4 py-2 text-[0.78rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                      >
                        Registrar atendimento
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {semEvolucao.length > 0 ? (
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-warning">
                Sessões anteriores sem evolução
              </p>
              <ul className="flex flex-col gap-2">
                {semEvolucao.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 text-[0.86rem]"
                  >
                    <span>
                      {a.paciente.usuario.nome}
                      <span className="text-muted">
                        {" "}
                        · {a.servico.nome} · {dataCurta(a.inicio)}
                      </span>
                    </span>
                    <Link
                      href={`/pro/pacientes/${a.pacienteId}/atender?agendamento=${a.id}`}
                      className="text-[0.8rem] font-semibold text-accent hover:underline"
                    >
                      Registrar
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <CardHead
            titulo="Seus últimos atendimentos"
            acao={
              <Link
                href="/pro/atendimentos"
                className="text-[0.78rem] font-semibold text-accent hover:underline"
              >
                Ver todos
              </Link>
            }
          />
          {recentes.length === 0 ? (
            <Vazio>Os atendimentos que você registrar aparecem aqui.</Vazio>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentes.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/pro/pacientes/${e.pacienteId}`}
                    className="block rounded-xl px-1 py-1 transition-colors hover:bg-sunken"
                  >
                    <p className="text-[0.9rem] font-semibold">
                      {e.paciente.usuario.nome}
                    </p>
                    <p className="text-[0.78rem] text-muted">
                      {e.agendamento.servico.nome} · {haQuantoTempo(e.criadoEm)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
