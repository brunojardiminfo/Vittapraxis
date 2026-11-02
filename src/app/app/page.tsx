import Link from "next/link";
import { db } from "@/lib/db";
import { destaquesAtivos } from "@/app/actions/destaques";
import { EsteiraDestaques } from "@/components/esteira-destaques";
import { pacienteDaSessao, primeiroNome } from "@/lib/paciente";
import {
  ROTULO_STATUS,
  dataLonga,
  diaMes,
  hora,
  moeda,
} from "@/lib/format";
import {
  BotaoLink,
  Card,
  CardHead,
  Pill,
  SectionTitle,
  Vazio,
} from "@/components/ui";
import {
  IconeAgenda,
  IconeEstrela,
  IconeMoeda,
  IconePerfil,
  IconePresente,
} from "@/components/icones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Início" };

const ATALHOS = [
  {
    href: "/app/agendamentos/solicitar",
    texto: "Pedir Horário",
    Icone: IconeAgenda,
  },
  {
    href: "/app/agendamentos/registrar",
    texto: "Registrar Sessão",
    Icone: IconeEstrela,
  },
  { href: "/app/beneficios", texto: "Clube de Benefícios", Icone: IconePresente },
];

export default async function DashboardPage() {
  const paciente = await pacienteDaSessao();
  const agora = new Date();

  const [proximo, conteudos, indicacoes, destaques] = await Promise.all([
    db.agendamento.findFirst({
      where: {
        pacienteId: paciente.id,
        inicio: { gte: agora },
        status: { in: ["AGENDADO", "CONFIRMADO"] },
      },
      orderBy: { inicio: "asc" },
      include: {
        servico: true,
        profissional: true,
      },
    }),
    db.conteudo.findMany({ orderBy: { publicadoEm: "desc" }, take: 4 }),
    db.indicacao.count({
      where: { pacienteId: paciente.id, status: "CONFIRMADA" },
    }),
    destaquesAtivos(),
  ]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[1.9rem]">
          Bem-vinda, {primeiroNome(paciente.usuario.nome)}
        </h1>
        <p className="mt-1 text-sm text-muted first-letter:uppercase">
          {dataLonga(agora)}
        </p>
      </header>

      {/* Faixa de boas-vindas com o índice em destaque */}
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-vp-green px-9 py-9 text-[var(--on-brand)] dark:border dark:border-line dark:bg-sunken dark:text-ink">
        <div
          className="pointer-events-none absolute -right-10 -top-32 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-vp-gold) 35%, transparent), transparent 70%)",
          }}
        />
        <div className="relative max-w-lg">
          <h2 className="mb-2 text-[1.5rem] text-[var(--on-brand)] dark:text-ink">
            Que bom te ver por aqui.
          </h2>
          <p className="text-[0.95rem] text-[color-mix(in_srgb,var(--on-brand)_82%,transparent)] dark:text-muted">
            Aqui você acompanha suas sessões e os benefícios do Clube.
          </p>
        </div>
      </section>

      <EsteiraDestaques itens={destaques} />

      {/* Atalhos */}
      <nav className="mb-9 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {ATALHOS.map(({ href, texto, Icone }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-4 py-5 transition-all hover:-translate-y-0.5 hover:border-accent"
          >
            <Icone className="h-5 w-5 text-accent" />
            <span className="text-[0.85rem] font-semibold">{texto}</span>
          </Link>
        ))}
      </nav>

      {/* Próximo agendamento */}
      <section className="mb-9">
        <SectionTitle
          acao={
            <Link
              href="/app/agendamentos"
              className="text-[0.82rem] font-semibold text-accent hover:underline"
            >
              Ver todos
            </Link>
          }
        >
          Próximo Agendamento
        </SectionTitle>

        {proximo ? (
          <article className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-surface p-6">
            <div className="w-16 shrink-0 rounded-xl border border-line bg-sunken py-2.5 text-center">
              <div className="font-serif text-[1.4rem] leading-none text-brand">
                {diaMes(proximo.inicio).dia}
              </div>
              <div className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-muted">
                {diaMes(proximo.inicio).mes}
              </div>
            </div>
            <div className="min-w-[12rem] flex-1">
              <h3 className="font-sans text-base font-semibold">
                {proximo.servico.nome}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[0.84rem] text-muted">
                <span>{hora(proximo.inicio)}</span>
                <span>{proximo.profissional.nome}</span>
                <Pill
                  tom={
                    (ROTULO_STATUS[proximo.status]?.tom ?? "muted") as
                      | "success"
                      | "warning"
                      | "danger"
                      | "muted"
                  }
                >
                  {ROTULO_STATUS[proximo.status]?.texto ?? proximo.status}
                </Pill>
              </div>
            </div>
            <BotaoLink href="/app/agendamentos" tamanho="sm">
              Ver detalhes
            </BotaoLink>
          </article>
        ) : (
          <Vazio>
            Você não tem sessões futuras.{" "}
            <Link
              href="/app/agendamentos/solicitar"
              className="font-semibold text-accent"
            >
              Solicitar agendamento
            </Link>
          </Vazio>
        )}
      </section>

      {/* Cards de resumo */}
      <section className="mb-9 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHead
            titulo="Clube de Benefícios"
            acao={<IconePresente className="h-4 w-4 text-accent" />}
          />
          <ul>
            {[
              {
                Icone: IconeMoeda,
                rotulo: "Cashback acumulado",
                valor: moeda(paciente.cashback),
              },
              {
                Icone: IconePerfil,
                rotulo: "Indicações confirmadas",
                valor: String(indicacoes),
              },
              {
                Icone: IconeEstrela,
                rotulo: "Pontos Premium",
                valor: paciente.pontos.toLocaleString("pt-BR"),
              },
            ].map(({ Icone, rotulo, valor }) => (
              <li
                key={rotulo}
                className="flex items-center gap-3 border-b border-line py-2.5 last:border-none last:pb-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sunken">
                  <Icone className="h-4 w-4 text-accent" />
                </span>
                <span className="flex-1 text-[0.86rem]">{rotulo}</span>
                <span className="text-[0.84rem] font-semibold tabular-nums text-success">
                  {valor}
                </span>
              </li>
            ))}
          </ul>
        </Card>

      </section>

      {/* Biblioteca */}
      <section>
        <SectionTitle
          acao={
            <Link
              href="/app/biblioteca"
              className="text-[0.82rem] font-semibold text-accent hover:underline"
            >
              Ver tudo
            </Link>
          }
        >
          Biblioteca de Saúde
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {conteudos.map((c) => (
            <Link
              key={c.id}
              href="/app/biblioteca"
              className="flex flex-col justify-between gap-8 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent"
            >
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-accent">
                {c.tipo}
              </span>
              <span className="text-[0.95rem] font-semibold leading-snug">
                {c.titulo}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
