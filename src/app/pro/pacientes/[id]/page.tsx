import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { profissionalId, idade } from "@/lib/profissional";
import {
  calcularIndice,
  dataCurta,
  faixaDor,
  frequencia,
  haQuantoTempo,
  hora,
} from "@/lib/format";
import { lerRegioes, rotulosDe } from "@/lib/mapa-corporal";
import { linkWhatsapp } from "@/lib/whatsapp";
import { Card, CardHead, Pill, Vazio } from "@/components/ui";
import { GraficoEvolucao } from "@/components/grafico-evolucao";
import { MapaCorporal } from "@/components/mapa-corporal";
import { IconeChat } from "@/components/icones";
import { FichaClinica } from "./ficha";
import { EditarEvolucao } from "./editar-evolucao";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await db.paciente.findUnique({
    where: { id },
    select: { usuario: { select: { nome: true } } },
  });
  return { title: p?.usuario.nome ?? "Paciente" };
}

function Indicador({
  rotulo,
  valor,
  apoio,
}: {
  rotulo: string;
  valor: string;
  apoio?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-2 text-[0.72rem] uppercase tracking-[0.1em] text-muted">
        {rotulo}
      </p>
      <p className="font-serif text-[1.6rem] leading-none text-brand">{valor}</p>
      {apoio ? <p className="mt-2 text-[0.76rem] text-muted">{apoio}</p> : null}
    </div>
  );
}

/** Bloco de texto de uma evolução, que só aparece quando foi preenchido. */
function Trecho({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto) return null;
  return (
    <div>
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">
        {titulo}
      </dt>
      <dd className="mt-0.5 whitespace-pre-line text-[0.88rem] leading-relaxed">
        {texto}
      </dd>
    </div>
  );
}

export default async function ProFichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ registrado?: string }>;
}) {
  const [{ id }, { registrado }, meuId] = await Promise.all([
    params,
    searchParams,
    profissionalId(),
  ]);

  const paciente = await db.paciente.findUnique({
    where: { id },
    include: {
      usuario: { select: { nome: true, criadoEm: true } },
      indices: { orderBy: { respondidoEm: "asc" } },
      agendamentos: {
        where: { status: { not: "CANCELADO" } },
        orderBy: { inicio: "desc" },
        include: {
          servico: { select: { nome: true } },
          profissional: { select: { id: true, nome: true, especialidade: true } },
          evolucao: true,
        },
      },
      pacotes: {
        where: { status: "ATIVO" },
        include: { servico: { select: { nome: true } } },
      },
    },
  });
  if (!paciente) notFound();

  const agora = new Date();
  const anos = idade(paciente.dataNascimento);
  const realizadas = paciente.agendamentos.filter(
    (a) => a.status === "CONCLUIDO" || a.evolucao
  );
  const proximas = paciente.agendamentos
    .filter((a) => a.inicio > agora && a.status !== "CONCLUIDO")
    .reverse();
  const ritmo = frequencia(realizadas.map((a) => a.inicio));
  const ultima = realizadas[0]?.inicio ?? null;

  // Bem-estar: o paciente responde no portal dele, e aqui vira o retrato do dia
  const indices = paciente.indices;
  const ultimoIndice = indices[indices.length - 1];
  const indiceAtual = ultimoIndice
    ? calcularIndice(ultimoIndice.humor, ultimoIndice.sono, ultimoIndice.dor)
    : null;

  // Mapa de dor do histórico: quantas vezes cada região apareceu
  const evolucoes = paciente.agendamentos.flatMap((a) =>
    a.evolucao ? [{ ...a.evolucao, agendamento: a }] : []
  );
  const contagem: Record<string, number> = {};
  for (const e of evolucoes.slice(0, 12)) {
    for (const r of lerRegioes(e.regioesDor)) contagem[r] = (contagem[r] ?? 0) + 1;
  }

  const zap = linkWhatsapp(paciente.whatsapp ?? paciente.telefone);

  return (
    <>
      <nav className="mb-5">
        <Link
          href="/pro/pacientes"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Pacientes
        </Link>
      </nav>

      {registrado ? (
        <p
          role="status"
          className="mb-6 rounded-2xl bg-success-bg px-5 py-4 text-[0.86rem] font-medium text-success"
        >
          Atendimento registrado. A sessão foi concluída e já conta no Clube do
          paciente.
        </p>
      ) : null}

      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.9rem]">{paciente.usuario.nome}</h1>
          <p className="mt-1 text-sm text-muted">
            {[
              anos !== null ? `${anos} anos` : null,
              paciente.dataNascimento
                ? `nascimento ${dataCurta(paciente.dataNascimento)}`
                : null,
              paciente.whatsapp ?? paciente.telefone,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {zap ? (
            <a
              href={zap}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              <IconeChat className="h-4 w-4" />
              WhatsApp
            </a>
          ) : null}
          <Link
            href={`/pro/pacientes/${paciente.id}/atender`}
            className="rounded-full bg-vp-green px-5 py-2.5 text-[0.84rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
          >
            Registrar atendimento
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          rotulo="Índice de bem-estar"
          valor={indiceAtual !== null ? indiceAtual.toFixed(1).replace(".", ",") : "—"}
          apoio={
            ultimoIndice
              ? `de 10 · ${haQuantoTempo(ultimoIndice.respondidoEm)}`
              : "ainda não respondeu"
          }
        />
        <Indicador
          rotulo="Sessões realizadas"
          valor={String(realizadas.length)}
          apoio={ultima ? `última ${haQuantoTempo(ultima)}` : "nenhuma ainda"}
        />
        <Indicador
          rotulo="Frequência"
          valor={ritmo ? `${ritmo.dias}d` : "—"}
          apoio={ritmo ? ritmo.texto : "precisa de 2 sessões"}
        />
        <Indicador
          rotulo="Dor no último registro"
          valor={
            evolucoes[0]?.dor !== null && evolucoes[0]?.dor !== undefined
              ? `${evolucoes[0].dor}/10`
              : ultimoIndice
                ? `${ultimoIndice.dor}/10`
                : "—"
          }
          apoio={
            evolucoes[0]?.dor !== null && evolucoes[0]?.dor !== undefined
              ? faixaDor(evolucoes[0].dor).rotulo
              : ultimoIndice
                ? "relatada pelo paciente"
                : null
          }
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start [&>*]:min-w-0">
        {/* ---------------- COLUNA ESQUERDA ---------------- */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <CardHead titulo="Ficha clínica" />
            <FichaClinica
              pacienteId={paciente.id}
              texto={paciente.fichaClinica ?? ""}
            />
          </Card>

          <Card className="p-6">
            <CardHead
              titulo="Histórico de atendimentos"
              acao={
                <span className="text-[0.78rem] text-muted">
                  {realizadas.length} no total
                </span>
              }
            />
            {realizadas.length === 0 ? (
              <Vazio>Nenhum atendimento realizado ainda.</Vazio>
            ) : (
              <ol className="flex max-h-[70rem] flex-col gap-3 overflow-y-auto">
                {realizadas.map((a) => {
                  const ev = a.evolucao;
                  const regioes = lerRegioes(ev?.regioesDor);
                  return (
                    <li
                      key={a.id}
                      // Sessão sem evolução vira uma linha só: o que importa
                      // ler são os atendimentos com registro
                      className={
                        ev
                          ? "rounded-xl border border-line bg-sunken p-4"
                          : "border-b border-line px-1 pb-2.5 last:border-none"
                      }
                    >
                      <div
                        className={`flex flex-wrap items-center justify-between gap-2 ${ev ? "mb-2" : ""}`}
                      >
                        <p className={ev ? "text-[0.9rem] font-semibold" : "text-[0.84rem]"}>
                          {dataCurta(a.inicio)} · {a.servico.nome}
                        </p>
                        <span className="text-[0.78rem] text-muted">
                          {a.profissional.nome}
                          {a.profissional.id === meuId ? " (você)" : ""}
                        </span>
                      </div>

                      {ev ? (
                        <dl className="flex flex-col gap-2.5">
                          <Trecho titulo="Queixa" texto={ev.queixa} />
                          <Trecho titulo="Conduta" texto={ev.conduta} />
                          <Trecho titulo="Evolução" texto={ev.evolucao} />
                          <Trecho titulo="Orientações" texto={ev.orientacoes} />
                          {ev.dor !== null || regioes.length > 0 ? (
                            <p className="flex flex-wrap items-center gap-2 text-[0.82rem]">
                              {ev.dor !== null ? (
                                <Pill tom={faixaDor(ev.dor).tom}>
                                  Dor {ev.dor}/10
                                </Pill>
                              ) : null}
                              <span className="text-muted">
                                {rotulosDe(regioes).join(" · ")}
                              </span>
                            </p>
                          ) : null}
                          {a.profissional.id === meuId ? (
                            <EditarEvolucao
                              evolucao={{
                                id: ev.id,
                                queixa: ev.queixa,
                                conduta: ev.conduta,
                                evolucao: ev.evolucao,
                                orientacoes: ev.orientacoes,
                              }}
                            />
                          ) : null}
                        </dl>
                      ) : (
                        a.profissional.id === meuId ? (
                          <p className="mt-0.5 text-[0.78rem] text-muted">
                            Sem evolução registrada.{" "}
                              <Link
                                href={`/pro/pacientes/${paciente.id}/atender?agendamento=${a.id}`}
                                className="font-semibold text-accent hover:underline"
                              >
                                Registrar agora
                              </Link>
                          </p>
                        ) : null
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        {/* ---------------- COLUNA DIREITA ---------------- */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <CardHead titulo="Mapa de dor" />
            {Object.keys(contagem).length === 0 ? (
              <Vazio>As regiões marcadas nos atendimentos aparecem aqui.</Vazio>
            ) : (
              <>
                <MapaCorporal contagem={contagem} />
                <p className="mt-2 text-[0.74rem] text-muted">
                  Somadas as últimas {Math.min(12, evolucoes.length)} evoluções
                  — quanto mais forte a cor, mais vezes a região apareceu.
                </p>
              </>
            )}
          </Card>

          <Card className="p-6">
            <CardHead titulo="Índice de bem-estar" />
            {indices.length === 0 ? (
              <Vazio>O paciente ainda não respondeu o questionário.</Vazio>
            ) : (
              <>
                {indices.length > 1 ? (
                  <GraficoEvolucao
                    pontos={indices.map((i) => ({
                      data: i.respondidoEm,
                      humor: i.humor,
                      sono: i.sono,
                      dor: i.dor,
                    }))}
                  />
                ) : null}
                {ultimoIndice?.observacao ? (
                  <p className="mt-4 rounded-xl bg-sunken px-4 py-3 text-[0.84rem] italic leading-relaxed">
                    &ldquo;{ultimoIndice.observacao}&rdquo;
                  </p>
                ) : null}
              </>
            )}
          </Card>

          {proximas.length > 0 || paciente.pacotes.length > 0 ? (
            <Card className="p-6">
              <CardHead titulo="Próximas sessões e pacotes" />
              <ul className="flex flex-col gap-2 text-[0.86rem]">
                {proximas.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex justify-between gap-3">
                    <span>
                      {a.servico.nome}
                      <span className="text-muted"> · {a.profissional.nome}</span>
                    </span>
                    <span className="text-muted">
                      {dataCurta(a.inicio)} {hora(a.inicio)}
                    </span>
                  </li>
                ))}
                {paciente.pacotes.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span>Pacote de {p.servico.nome}</span>
                    <span className="text-muted">
                      {p.sessoesContratadas - p.sessoesUtilizadas} de{" "}
                      {p.sessoesContratadas} restantes
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
