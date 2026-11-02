import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  ROTULO_STATUS,
  calcularIndice,
  dataCurta,
  frequencia,
  haQuantoTempo,
  hora,
  moeda,
} from "@/lib/format";
import { linkWhatsapp } from "@/lib/whatsapp";
import { nivelDe, regrasDoClube } from "@/lib/clube";
import { Card, CardHead, Pill, Progress, SectionTitle, Vazio } from "@/components/ui";
import { IconeChat, IconePresente } from "@/components/icones";
import { AjusteClube } from "../ajuste";
import { FormularioCadastro } from "./cadastro";

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

const TOM_AG: Record<string, "success" | "warning" | "danger" | "muted"> = {
  CONFIRMADO: "success",
  EM_ATENDIMENTO: "success",
  AGENDADO: "warning",
  CONCLUIDO: "muted",
  CANCELADO: "danger",
};

/** Bloco de número com rótulo, para a faixa de indicadores do topo. */
function Indicador({
  rotulo,
  valor,
  apoio,
}: {
  rotulo: string;
  valor: string;
  apoio?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-2 text-[0.72rem] uppercase tracking-[0.1em] text-muted">
        {rotulo}
      </p>
      <p className="font-serif text-[1.7rem] leading-none text-brand">
        {valor}
      </p>
      {apoio ? (
        <p className="mt-2 text-[0.76rem] text-muted">{apoio}</p>
      ) : null}
    </div>
  );
}

export default async function FichaPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const paciente = await db.paciente.findUnique({
    where: { id },
    include: {
      usuario: {
        select: { nome: true, email: true, ultimoAcesso: true, criadoEm: true },
      },
      agendamentos: {
        orderBy: { inicio: "desc" },
        include: {
          servico: { select: { nome: true } },
          profissional: { select: { nome: true } },
        },
      },
      lancamentos: { orderBy: { criadoEm: "desc" }, take: 30 },
      vouchers: { orderBy: { validoAte: "asc" } },
      indicacoes: { orderBy: { criadoEm: "desc" } },
      feedbacks: { orderBy: { criadoEm: "desc" } },
      indices: { orderBy: { respondidoEm: "desc" }, take: 12 },
      pacotes: {
        where: { status: "ATIVO" },
        include: { servico: { select: { nome: true } } },
      },
      indicadaPor: { include: { paciente: { include: { usuario: true } } } },
    },
  });

  if (!paciente) notFound();

  const regras = await regrasDoClube();
  const { atual, proximo, progresso } = nivelDe(paciente.pontos, regras);

  const agora = new Date();
  const concluidas = paciente.agendamentos.filter(
    (a) => a.status === "CONCLUIDO"
  );
  const futuras = paciente.agendamentos.filter(
    (a) =>
      a.inicio >= agora &&
      ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"].includes(a.status)
  );
  const aguardando = paciente.agendamentos.filter(
    (a) =>
      a.inicio < agora &&
      ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"].includes(a.status)
  );

  const ritmo = frequencia(concluidas.map((a) => a.inicio));
  const ultimaSessao = concluidas[0]?.inicio ?? null;
  const acesso = haQuantoTempo(paciente.usuario.ultimoAcesso);
  // Índice de bem-estar: a última resposta e para onde ela andou
  const indices = paciente.indices;
  const ultimoIndice = indices[0];
  const indiceAtual = ultimoIndice
    ? calcularIndice(ultimoIndice.humor, ultimoIndice.sono, ultimoIndice.dor)
    : null;
  const indiceAnterior = indices[1]
    ? calcularIndice(indices[1].humor, indices[1].sono, indices[1].dor)
    : null;
  const variacaoIndice =
    indiceAtual !== null && indiceAnterior !== null
      ? Math.round((indiceAtual - indiceAnterior) * 10) / 10
      : null;

  const vouchersAtivos = paciente.vouchers.filter(
    (v) => v.status === "DISPONIVEL" && v.validoAte >= agora
  );

  const zap = linkWhatsapp(
    paciente.whatsapp ?? paciente.telefone,
    `Olá, ${paciente.usuario.nome.split(" ")[0]}! Aqui é da Vitapraxis.`
  );

  // Sumido: tem histórico, mas a última sessão ficou para trás do ritmo dele
  const sumido =
    ritmo && ultimaSessao
      ? (agora.getTime() - ultimaSessao.getTime()) / 86_400_000 > ritmo.dias * 2
      : false;

  return (
    <>
      <nav className="mb-5">
        <Link
          href="/admin/pacientes"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Pacientes
        </Link>
      </nav>

      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-[1.7rem]">{paciente.usuario.nome}</h1>
            <Pill tom={paciente.consentimentoLgpd ? "success" : "warning"}>
              {paciente.consentimentoLgpd ? "LGPD ok" : "LGPD pendente"}
            </Pill>
            {sumido ? <Pill tom="danger">Fora do ritmo</Pill> : null}
          </div>
          <p className="text-sm text-muted">
            Paciente desde {dataCurta(paciente.usuario.criadoEm)} ·{" "}
            {acesso ? `acessou a plataforma ${acesso}` : "nunca acessou a plataforma"}
          </p>
        </div>

        {zap ? (
          <a
            href={zap}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-vp-green px-5 py-2.5 text-[0.84rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
          >
            <IconeChat className="h-4 w-4" />
            WhatsApp
          </a>
        ) : null}
      </header>

      {/* ---------------- INDICADORES ---------------- */}
      <section className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          rotulo="Sessões realizadas"
          valor={String(concluidas.length)}
          apoio={
            ultimaSessao
              ? `última ${haQuantoTempo(ultimaSessao)}`
              : "nenhuma ainda"
          }
        />
        <Indicador
          rotulo="Frequência"
          valor={ritmo ? `${ritmo.dias}d` : "—"}
          apoio={ritmo ? ritmo.texto : "precisa de 2 sessões"}
        />
        <Indicador
          rotulo="Pontos"
          valor={paciente.pontos.toLocaleString("pt-BR")}
          apoio={`faixa ${atual.nome}`}
        />
        <Indicador
          rotulo="Crédito"
          valor={moeda(paciente.cashback)}
          apoio={`${vouchersAtivos.length} ${vouchersAtivos.length === 1 ? "voucher ativo" : "vouchers ativos"}`}
        />
      </section>

      {aguardando.length > 0 ? (
        <p className="mb-7 rounded-2xl bg-warning-bg px-5 py-4 text-[0.86rem] font-medium text-warning">
          {aguardando.length}{" "}
          {aguardando.length === 1
            ? "sessão já passou da hora e espera confirmação"
            : "sessões já passaram da hora e esperam confirmação"}
          .{" "}
          <Link href="/admin/sessoes" className="underline">
            Confirmar agora
          </Link>
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        {/* ---------------- COLUNA ESQUERDA ---------------- */}
        <div className="flex flex-col gap-6">
          <FormularioCadastro
            paciente={{
              id: paciente.id,
              telefone: paciente.telefone,
              whatsapp: paciente.whatsapp,
              dataNascimento: paciente.dataNascimento
                ? paciente.dataNascimento.toISOString().slice(0, 10)
                : "",
              endereco: paciente.endereco,
              emergenciaNome: paciente.emergenciaNome,
              emergenciaFone: paciente.emergenciaFone,
            }}
            email={paciente.usuario.email}
            codigo={paciente.codigoIndicacao}
          />

          <Card className="p-6">
            <CardHead titulo="Próximas sessões" />
            {futuras.length === 0 ? (
              <Vazio>Nada agendado no momento.</Vazio>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {futuras.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sunken px-4 py-3"
                  >
                    <span className="text-[0.88rem]">
                      {a.servico.nome}
                      <span className="text-muted">
                        {" "}
                        · {a.profissional.nome}
                      </span>
                    </span>
                    <span className="text-[0.84rem] text-muted">
                      {dataCurta(a.inicio)} às {hora(a.inicio)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <CardHead
              titulo="Histórico de sessões"
              acao={
                <span className="text-[0.78rem] text-muted">
                  {paciente.agendamentos.length} no total
                </span>
              }
            />
            {paciente.agendamentos.length === 0 ? (
              <Vazio>Nenhuma sessão registrada.</Vazio>
            ) : (
              <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                {paciente.agendamentos.slice(0, 40).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-2 last:border-none"
                  >
                    <span className="text-[0.86rem]">
                      {dataCurta(a.inicio)}
                      <span className="text-muted"> · {a.servico.nome}</span>
                    </span>
                    <Pill tom={TOM_AG[a.status] ?? "muted"}>
                      {ROTULO_STATUS[a.status]?.texto ?? a.status}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ---------------- COLUNA DIREITA ---------------- */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <CardHead titulo="Clube" />

            <div className="mb-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="font-sans text-[0.95rem] font-semibold">
                  {atual.nome}
                </span>
                <span className="text-[0.8rem] text-muted">
                  {proximo
                    ? `faltam ${(proximo.minimo - paciente.pontos).toLocaleString("pt-BR")} para ${proximo.nome}`
                    : "faixa máxima"}
                </span>
              </div>
              <Progress valor={progresso} />
            </div>

            <AjusteClube
              id={paciente.id}
              nome={paciente.usuario.nome}
              pontos={paciente.pontos}
              cashback={paciente.cashback}
            />

            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
                Extrato
              </p>
              {paciente.lancamentos.length === 0 ? (
                <p className="text-[0.84rem] text-muted">
                  Nenhum lançamento ainda.
                </p>
              ) : (
                <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                  {paciente.lancamentos.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-start justify-between gap-3 text-[0.82rem]"
                    >
                      <span className="min-w-0">
                        <span className="block">{l.motivo}</span>
                        <span className="text-[0.76rem] text-muted">
                          {dataCurta(l.criadoEm)}
                          {l.autor ? ` · ${l.autor}` : ""}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-semibold tabular-nums ${
                          l.valor >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {l.valor >= 0 ? "+" : ""}
                        {l.tipo === "CASHBACK"
                          ? moeda(l.valor)
                          : `${l.valor} pts`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {vouchersAtivos.length > 0 ? (
            <Card className="p-6">
              <CardHead titulo="Vouchers ativos" />
              <ul className="flex flex-col gap-2.5">
                {vouchersAtivos.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-start gap-3 rounded-xl bg-sunken px-4 py-3"
                  >
                    <IconePresente className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-[0.86rem]">
                      {v.titulo}
                      {v.valor ? ` · ${moeda(v.valor)}` : ""}
                      {v.percentual ? ` · ${v.percentual}%` : ""}
                      <span className="block text-[0.78rem] text-muted">
                        vale até {dataCurta(v.validoAte)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {paciente.pacotes.length > 0 ? (
            <Card className="p-6">
              <CardHead titulo="Pacotes ativos" />
              <ul className="flex flex-col gap-3">
                {paciente.pacotes.map((p) => (
                  <li key={p.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.86rem]">
                      <span>{p.servico.nome}</span>
                      <span className="text-muted">
                        {p.sessoesContratadas - p.sessoesUtilizadas} de{" "}
                        {p.sessoesContratadas} restantes
                      </span>
                    </div>
                    <Progress
                      valor={
                        (p.sessoesUtilizadas / p.sessoesContratadas) * 100
                      }
                    />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-6">
            <CardHead
              titulo="Índice de Bem-Estar"
              acao={
                variacaoIndice !== null ? (
                  <span
                    className={`text-[0.78rem] font-semibold ${
                      variacaoIndice >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {variacaoIndice >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(variacaoIndice).toFixed(1).replace(".", ",")}
                  </span>
                ) : null
              }
            />

            {!ultimoIndice ? (
              <Vazio>O paciente ainda não respondeu o questionário.</Vazio>
            ) : (
              <>
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="font-serif text-[2.1rem] leading-none text-brand">
                    {indiceAtual!.toFixed(1).replace(".", ",")}
                  </span>
                  <span className="text-[0.8rem] text-muted">
                    de 10 · respondido {haQuantoTempo(ultimoIndice.respondidoEm)}
                  </span>
                </div>

                {/* Cada eixo na mesma escala de 0 a 10, para comparar lado a
                    lado: dor e hidratação são coletadas em faixas diferentes. */}
                <dl className="flex flex-col gap-2.5">
                  {[
                    ["Humor e energia", ((ultimoIndice.humor - 1) / 4) * 10],
                    ["Qualidade do sono", ((ultimoIndice.sono - 1) / 4) * 10],
                    ["Hidratação", ((ultimoIndice.hidratacao - 1) / 4) * 10],
                    ["Conforto (dor invertida)", 10 - ultimoIndice.dor],
                  ].map(([rotulo, v]) => (
                    <div key={rotulo as string}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 text-[0.82rem]">
                        <span>{rotulo}</span>
                        <span className="font-semibold tabular-nums">
                          {(v as number).toFixed(1).replace(".", ",")}
                        </span>
                      </div>
                      <Progress valor={(v as number) * 10} />
                    </div>
                  ))}
                </dl>

                <p className="mt-4 flex items-center gap-2 text-[0.82rem] text-muted">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      ultimoIndice.exercitou ? "bg-success" : "bg-line"
                    }`}
                  />
                  {ultimoIndice.exercitou
                    ? "Já havia se exercitado no dia"
                    : "Não havia se exercitado no dia"}
                </p>

                {ultimoIndice.observacao ? (
                  <p className="mt-3 rounded-xl bg-sunken px-4 py-3 text-[0.84rem] italic leading-relaxed">
                    &ldquo;{ultimoIndice.observacao}&rdquo;
                  </p>
                ) : null}

                {indices.length > 1 ? (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="mb-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
                      Respostas anteriores
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {indices.slice(1).map((i) => (
                        <li
                          key={i.id}
                          className="flex items-center justify-between gap-3 text-[0.82rem]"
                        >
                          <span className="text-muted">
                            {dataCurta(i.respondidoEm)}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {calcularIndice(i.humor, i.sono, i.dor)
                              .toFixed(1)
                              .replace(".", ",")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </Card>

          <Card className="p-6">
            <CardHead titulo="Indicações" />
            {paciente.indicadaPor ? (
              <p className="mb-3 rounded-xl bg-sunken px-4 py-3 text-[0.84rem]">
                Chegou pela indicação de{" "}
                <strong className="font-semibold">
                  {paciente.indicadaPor.paciente.usuario.nome}
                </strong>
              </p>
            ) : null}

            {paciente.indicacoes.length === 0 ? (
              <p className="text-[0.84rem] text-muted">
                Ainda não indicou ninguém.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {paciente.indicacoes.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between gap-3 text-[0.86rem]"
                  >
                    <span>{i.nome}</span>
                    <Pill
                      tom={i.status === "CONFIRMADA" ? "success" : "warning"}
                    >
                      {i.status === "CONFIRMADA" ? "Confirmada" : "Pendente"}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 border-t border-line pt-3 text-[0.8rem] text-muted">
              Código:{" "}
              <strong className="font-semibold tracking-wider text-accent">
                {paciente.codigoIndicacao}
              </strong>
            </p>
          </Card>

          {paciente.feedbacks.length > 0 ? (
            <Card className="p-6">
              <CardHead titulo="Mensagens enviadas" />
              <ul className="flex flex-col gap-3">
                {paciente.feedbacks.slice(0, 5).map((f) => (
                  <li key={f.id} className="text-[0.85rem]">
                    <div className="mb-1 flex flex-wrap items-center gap-2.5">
                      <span className="font-semibold">{f.assunto}</span>
                      <Pill tom={f.status === "RESOLVIDO" ? "success" : "warning"}>
                        {f.status === "RESOLVIDO" ? "Respondido" : "Aberto"}
                      </Pill>
                    </div>
                    <p className="text-[0.82rem] text-muted">
                      {dataCurta(f.criadoEm)}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/feedback"
                className="mt-4 inline-block text-[0.82rem] font-semibold text-accent hover:underline"
              >
                Ver no canal de feedback →
              </Link>
            </Card>
          ) : null}
        </div>
      </div>

      <SectionTitle>&nbsp;</SectionTitle>
    </>
  );
}
