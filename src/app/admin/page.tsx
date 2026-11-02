import Link from "next/link";
import { db } from "@/lib/db";
import {
  dataCurta,
  dataLonga,
  haQuantoTempo,
  hora,
  moeda,
  ROTULO_STATUS,
} from "@/lib/format";
import { nivelDe, regrasDoClube } from "@/lib/clube";
import { linkWhatsapp } from "@/lib/whatsapp";
import { Card, CardHead, Pill, SectionTitle, Vazio } from "@/components/ui";
import { Colunas } from "@/components/barras";
import { IconeChat } from "@/components/icones";
import { marcarLeadContatado } from "@/app/actions/leads";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visão Geral" };

/** Janelas que o filtro do topo oferece. */
const JANELAS = {
  "30": { dias: 30, texto: "30 dias" },
  "60": { dias: 60, texto: "60 dias" },
  "90": { dias: 90, texto: "90 dias" },
  "180": { dias: 180, texto: "6 meses" },
} as const;

type ChaveJanela = keyof typeof JANELAS;

function Indicador({
  rotulo,
  valor,
  apoio,
  href,
  alerta,
}: {
  rotulo: string;
  valor: string;
  apoio?: string;
  href?: string;
  alerta?: boolean;
}) {
  const corpo = (
    <>
      <p className="mb-2 text-[0.72rem] uppercase tracking-[0.1em] text-muted">
        {rotulo}
      </p>
      <p
        className={`font-serif text-[1.9rem] leading-none ${
          alerta ? "text-warning" : "text-brand"
        }`}
      >
        {valor}
      </p>
      {apoio ? <p className="mt-2 text-[0.76rem] text-muted">{apoio}</p> : null}
    </>
  );

  const classe = `rounded-2xl border bg-surface p-5 ${
    alerta ? "border-warning" : "border-line"
  }`;

  return href ? (
    <Link href={href} className={`${classe} block transition-colors hover:border-accent`}>
      {corpo}
    </Link>
  ) : (
    <div className={classe}>{corpo}</div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ janela?: string }>;
}) {
  const { janela } = await searchParams;
  const chave: ChaveJanela =
    janela && janela in JANELAS ? (janela as ChaveJanela) : "90";
  const { dias, texto: textoJanela } = JANELAS[chave];

  const agora = new Date();
  const inicioJanela = new Date(agora);
  inicioJanela.setDate(inicioJanela.getDate() - dias);

  const inicioDia = new Date(agora);
  inicioDia.setHours(0, 0, 0, 0);
  const mesAtual = agora.getMonth();

  const [
    totalPacientes,
    ativos,
    concluidasJanela,
    canceladasJanela,
    proximos7,
    pacientesComSessao,
    agregadoClube,
    leadsNovos,
    sessoesPendentes,
    vouchersAtivos,
  ] = await Promise.all([
    db.paciente.count(),
    db.paciente.count({
      where: {
        agendamentos: {
          some: { status: "CONCLUIDO", inicio: { gte: inicioJanela } },
        },
      },
    }),
    db.agendamento.count({
      where: { status: "CONCLUIDO", inicio: { gte: inicioJanela } },
    }),
    db.agendamento.count({
      where: { status: "CANCELADO", inicio: { gte: inicioJanela } },
    }),
    db.agendamento.findMany({
      where: {
        inicio: {
          gte: inicioDia,
          lt: new Date(inicioDia.getTime() + 7 * 86_400_000),
        },
        status: { not: "CANCELADO" },
      },
      select: { inicio: true },
    }),
    // Base para ranking e para quem sumiu: todo paciente com o histórico dele
    db.paciente.findMany({
      select: {
        id: true,
        pontos: true,
        dataNascimento: true,
        telefone: true,
        whatsapp: true,
        usuario: { select: { nome: true, ultimoAcesso: true } },
        agendamentos: {
          where: { status: "CONCLUIDO" },
          orderBy: { inicio: "desc" },
          select: { inicio: true },
        },
      },
    }),
    db.paciente.aggregate({ _sum: { cashback: true, pontos: true } }),
    db.lead.findMany({ where: { status: "NOVO" }, orderBy: { criadoEm: "desc" } }),
    db.agendamento.count({
      where: {
        inicio: { lte: agora },
        status: { in: ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"] },
      },
    }),
    db.voucher.count({
      where: { status: "DISPONIVEL", validoAte: { gte: agora } },
    }),
  ]);

  const regras = await regrasDoClube();

  /* --- Quem sumiu ---------------------------------------------------------
     Olhamos só quem já veio: um cadastro novo que ainda não fez a primeira
     sessão é tarefa de outra natureza, não um paciente perdido. */
  const comHistorico = pacientesComSessao.filter(
    (p) => p.agendamentos.length > 0
  );

  const sumidos = comHistorico
    .map((p) => {
      const ultima = p.agendamentos[0].inicio;
      const diasSem = Math.floor(
        (agora.getTime() - ultima.getTime()) / 86_400_000
      );
      return { ...p, ultima, diasSem };
    })
    .filter((p) => p.diasSem > dias)
    .sort((a, b) => a.diasSem - b.diasSem);

  /* --- Top pacientes: quem mais se trata na janela --- */
  const top = comHistorico
    .map((p) => ({
      ...p,
      naJanela: p.agendamentos.filter((a) => a.inicio >= inicioJanela).length,
    }))
    .filter((p) => p.naJanela > 0)
    .sort((a, b) => b.naJanela - a.naJanela || b.pontos - a.pontos)
    .slice(0, 6);

  /* --- Aniversariantes do mês --- */
  const aniversariantes = pacientesComSessao
    .filter((p) => p.dataNascimento?.getMonth() === mesAtual)
    .sort(
      (a, b) =>
        (a.dataNascimento?.getDate() ?? 0) - (b.dataNascimento?.getDate() ?? 0)
    );

  /* --- Agenda dos próximos 7 dias --- */
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioDia);
    d.setDate(d.getDate() + i);
    const proximo = new Date(d);
    proximo.setDate(proximo.getDate() + 1);
    return {
      rotulo: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(d)
        .replace(".", ""),
      sub: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(d),
      valor: proximos7.filter((a) => a.inicio >= d && a.inicio < proximo).length,
    };
  });

  const realizadas = concluidasJanela + canceladasJanela;
  const comparecimento =
    realizadas > 0 ? Math.round((concluidasJanela / realizadas) * 100) : null;

  return (
    <>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem]">Visão Geral da Clínica</h1>
          <p className="mt-1 text-sm text-muted first-letter:uppercase">
            {dataLonga(agora)}
          </p>
        </div>

        <div className="inline-flex gap-1.5 rounded-xl bg-sunken p-1.5">
          {(Object.keys(JANELAS) as ChaveJanela[]).map((k) => (
            <Link
              key={k}
              href={`/admin?janela=${k}`}
              scroll={false}
              className={`rounded-lg px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                chave === k
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {JANELAS[k].texto}
            </Link>
          ))}
        </div>
      </header>

      {/* ---------------- O QUE PRECISA DE AÇÃO ---------------- */}
      {sessoesPendentes > 0 || leadsNovos.length > 0 ? (
        <div className="mb-7 flex flex-wrap gap-2.5">
          {sessoesPendentes > 0 ? (
            <Link
              href="/admin/sessoes"
              className="rounded-full bg-warning-bg px-5 py-2.5 text-[0.84rem] font-semibold text-warning transition-opacity hover:opacity-80"
            >
              {sessoesPendentes}{" "}
              {sessoesPendentes === 1
                ? "sessão a confirmar"
                : "sessões a confirmar"}{" "}
              →
            </Link>
          ) : null}
          {leadsNovos.length > 0 ? (
            <a
              href="#contatos"
              className="rounded-full bg-warning-bg px-5 py-2.5 text-[0.84rem] font-semibold text-warning transition-opacity hover:opacity-80"
            >
              {leadsNovos.length}{" "}
              {leadsNovos.length === 1
                ? "contato novo do site"
                : "contatos novos do site"}{" "}
              ↓
            </a>
          ) : null}
        </div>
      ) : null}

      {/* ---------------- INDICADORES ---------------- */}
      <section className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          rotulo="Pacientes ativos"
          valor={String(ativos)}
          apoio={`de ${totalPacientes} · últimos ${textoJanela}`}
          href="/admin/pacientes"
        />
        <Indicador
          rotulo="Sessões realizadas"
          valor={String(concluidasJanela)}
          apoio={
            comparecimento !== null
              ? `${comparecimento}% de comparecimento`
              : `nos últimos ${textoJanela}`
          }
        />
        <Indicador
          rotulo="Fora do radar"
          valor={String(sumidos.length)}
          apoio={`sem vir há mais de ${textoJanela}`}
          alerta={sumidos.length > 0}
        />
        <Indicador
          rotulo="Vouchers ativos"
          valor={String(vouchersAtivos)}
          apoio={`${moeda(agregadoClube._sum.cashback ?? 0)} em crédito na base`}
          href="/admin/vouchers"
        />
      </section>

      {/* ---------------- AGENDA E RETORNO ---------------- */}
      <section className="mb-9 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <CardHead
            titulo="Agenda dos próximos 7 dias"
            acao={
              <span className="text-[0.78rem] text-muted">
                {proximos7.length} sessões
              </span>
            }
          />
          <Colunas dados={semana} />
        </Card>

        <Card className="p-6">
          <CardHead
            titulo="Para chamar de volta"
            acao={
              sumidos.length > 0 ? (
                <span className="text-[0.78rem] text-muted">
                  {sumidos.length} no total
                </span>
              ) : null
            }
          />
          {sumidos.length === 0 ? (
            <Vazio>Ninguém sumido no período. Boa.</Vazio>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {sumidos.slice(0, 5).map((p) => {
                const zap = linkWhatsapp(
                  p.whatsapp ?? p.telefone,
                  `Olá, ${p.usuario.nome.split(" ")[0]}! Aqui é da Vitapraxis. Sentimos sua falta — que tal marcarmos um retorno?`
                );
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 border-b border-line pb-2.5 last:border-none last:pb-0"
                  >
                    <Link
                      href={`/admin/pacientes/${p.id}`}
                      className="min-w-0 text-[0.86rem] hover:text-accent"
                    >
                      <span className="block truncate">{p.usuario.nome}</span>
                      <span className="text-[0.78rem] text-muted">
                        última sessão {haQuantoTempo(p.ultima)}
                      </span>
                    </Link>
                    {zap ? (
                      <a
                        href={zap}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Chamar ${p.usuario.nome} no WhatsApp`}
                        className="shrink-0 rounded-lg border border-line p-2 text-muted transition-colors hover:border-accent hover:text-accent"
                      >
                        <IconeChat className="h-4 w-4" />
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* ---------------- PESSOAS ---------------- */}
      <section className="mb-9 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <CardHead titulo={`Quem mais se trata · ${textoJanela}`} />
          {top.length === 0 ? (
            <Vazio>Nenhuma sessão concluída no período.</Vazio>
          ) : (
            <ul className="flex flex-col gap-3">
              {top.map((p, i) => {
                const { atual } = nivelDe(p.pontos, regras);
                return (
                  <li key={p.id} className="flex items-center gap-3.5">
                    <span className="w-5 shrink-0 font-serif text-[1.1rem] text-accent">
                      {i + 1}
                    </span>
                    <Link
                      href={`/admin/pacientes/${p.id}`}
                      className="min-w-0 flex-1 truncate text-[0.88rem] hover:text-accent"
                    >
                      {p.usuario.nome}
                    </Link>
                    <Pill tom="muted">{atual.nome}</Pill>
                    <span className="shrink-0 text-[0.84rem] font-semibold tabular-nums">
                      {p.naJanela}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <CardHead
            titulo="Aniversariantes do mês"
            acao={
              aniversariantes.length > 0 ? (
                <Link
                  href="/admin/vouchers"
                  className="text-[0.78rem] font-semibold text-accent hover:underline"
                >
                  emitir vouchers
                </Link>
              ) : null
            }
          />
          {aniversariantes.length === 0 ? (
            <Vazio>Ninguém faz aniversário este mês.</Vazio>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {aniversariantes.slice(0, 7).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-none last:pb-0"
                >
                  <Link
                    href={`/admin/pacientes/${p.id}`}
                    className="min-w-0 truncate text-[0.86rem] hover:text-accent"
                  >
                    {p.usuario.nome}
                  </Link>
                  <span className="shrink-0 text-[0.82rem] text-muted">
                    dia {p.dataNascimento?.getDate()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* ---------------- CONTATOS DO SITE ---------------- */}
      <section id="contatos" className="mb-9 scroll-mt-6">
        <SectionTitle>Contatos novos do site</SectionTitle>
        {leadsNovos.length === 0 ? (
          <Vazio>Nenhum contato novo — tudo em dia.</Vazio>
        ) : (
          <ul className="flex flex-col gap-3">
            {leadsNovos.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-surface p-5"
              >
                <div className="min-w-[15rem] flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <h3 className="font-sans text-[0.98rem] font-semibold">
                      {l.nome}
                    </h3>
                    <Pill tom="warning">Novo</Pill>
                  </div>
                  <p className="text-[0.84rem] text-muted">
                    Interesse: {l.interesse ?? "ainda não sabe"} ·{" "}
                    {dataCurta(l.criadoEm)}
                  </p>
                  {l.indicadoPor ? (
                    <p className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-success-bg px-3 py-1 text-[0.78rem] font-semibold text-success">
                      Indicado por {l.indicadoPor}
                    </p>
                  ) : null}
                  {l.mensagem ? (
                    <p className="mt-2 whitespace-pre-line rounded-lg bg-sunken px-3.5 py-2.5 text-[0.85rem] italic">
                      {l.mensagem}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-4 text-[0.84rem]">
                    <a
                      href={linkWhatsapp(l.telefone) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent hover:underline"
                    >
                      WhatsApp {l.telefone}
                    </a>
                    <a
                      href={`mailto:${l.email}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      {l.email}
                    </a>
                  </div>
                </div>
                <form action={marcarLeadContatado}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                  >
                    Já falei
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------------- HOJE ---------------- */}
      <section>
        <SectionTitle>Sessões de hoje</SectionTitle>
        <SessoesDeHoje inicioDia={inicioDia} />
      </section>
    </>
  );
}

async function SessoesDeHoje({ inicioDia }: { inicioDia: Date }) {
  const fimDia = new Date(inicioDia);
  fimDia.setHours(23, 59, 59, 999);

  const sessoes = await db.agendamento.findMany({
    where: { inicio: { gte: inicioDia, lte: fimDia } },
    orderBy: { inicio: "asc" },
    include: {
      servico: { select: { nome: true } },
      paciente: {
        select: { id: true, usuario: { select: { nome: true } } },
      },
      profissional: { select: { nome: true } },
    },
  });

  if (sessoes.length === 0) {
    return <Vazio>Nenhuma sessão marcada para hoje.</Vazio>;
  }

  const TOM: Record<string, "success" | "warning" | "muted" | "danger"> = {
    CONFIRMADO: "success",
    EM_ATENDIMENTO: "success",
    AGENDADO: "warning",
    CONCLUIDO: "muted",
    CANCELADO: "danger",
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-[0.86rem]">
        <thead>
          <tr className="bg-sunken text-left">
            {["Horário", "Paciente", "Serviço", "Profissional", "Situação"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sessoes.map((s) => (
            <tr key={s.id} className="border-t border-line bg-surface">
              <td className="px-4 py-3 tabular-nums">{hora(s.inicio)}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/pacientes/${s.paciente.id}`}
                  className="hover:text-accent"
                >
                  {s.paciente.usuario.nome}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{s.servico.nome}</td>
              <td className="px-4 py-3 text-muted">{s.profissional.nome}</td>
              <td className="px-4 py-3">
                <Pill tom={TOM[s.status] ?? "muted"}>
                  {ROTULO_STATUS[s.status]?.texto ?? s.status}
                </Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
