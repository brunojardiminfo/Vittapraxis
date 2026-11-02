import Link from "next/link";
import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { ROTULO_STATUS, dataCurta, diaMes, hora } from "@/lib/format";
import { linkGoogleAgenda } from "@/lib/calendario";
import { BotaoLink, Pill, Vazio } from "@/components/ui";
import { IconeCheck, IconeQr, IconeRelogio } from "@/components/icones";
import { AdicionarAgenda } from "@/components/adicionar-agenda";
import { Pacotes } from "./pacotes";
import {
  cancelarAgendamento,
  confirmarAgendamento,
  fazerCheckin,
} from "@/app/actions/agendamentos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agendamentos" };

type Aba = "proximos" | "historico";

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; enviado?: string }>;
}) {
  const { aba: abaParam, enviado } = await searchParams;
  const aba: Aba = abaParam === "historico" ? "historico" : "proximos";

  const paciente = await pacienteDaSessao();
  const agora = new Date();

  // Aberto x encerrado, e não futuro x passado: uma sessão de ontem que a
  // pessoa ainda não confirmou continua pedindo ação dela, e sumiria da vista
  // se o corte fosse pela data.
  const agendamentos = await db.agendamento.findMany({
    where:
      aba === "proximos"
        ? {
            pacienteId: paciente.id,
            status: { in: ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"] },
          }
        : {
            pacienteId: paciente.id,
            status: { in: ["CONCLUIDO", "CANCELADO"] },
          },
    orderBy: { inicio: aba === "proximos" ? "asc" : "desc" },
    include: {
      servico: true,
      profissional: true,
    },
  });

  const [pacotes, servicos] = await Promise.all([
    db.pacote.findMany({
      where: { pacienteId: paciente.id, status: "ATIVO" },
      orderBy: { validade: "asc" },
      include: { servico: { select: { nome: true } } },
    }),
    db.servico.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-[1.9rem]">Minha Agenda</h1>
        <p className="mt-1 text-sm text-muted">
          Suas sessões, do pedido do horário à conclusão
        </p>

        {/* As duas ações centrais em destaque: é o que a pessoa vem fazer
            aqui. A lista fica logo abaixo, como consulta. */}
        <div className="mt-7 flex flex-wrap justify-center gap-3.5">
          <BotaoLink href="/app/agendamentos/solicitar">
            Pedir horário pelo WhatsApp
          </BotaoLink>
          <Link
            href="/app/agendamentos/registrar"
            className="inline-flex items-center justify-center rounded-full border border-accent px-7 py-3.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-[var(--on-brand)]"
          >
            Registrar minhas sessões
          </Link>
        </div>
      </header>

      {enviado ? (
        <p className="mb-6 flex items-start gap-2.5 rounded-2xl bg-success-bg px-5 py-4 text-[0.88rem] font-medium text-success">
          <IconeCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Pedido enviado pelo WhatsApp. Assim que a clínica confirmar o
          horário, você pode registrar a sessão aqui para acompanhar.
        </p>
      ) : null}

      <Pacotes
        pacotes={pacotes.map((p) => ({
          id: p.id,
          servicoNome: p.servico.nome,
          sessoesContratadas: p.sessoesContratadas,
          sessoesUtilizadas: p.sessoesUtilizadas,
          validade: dataCurta(p.validade),
        }))}
        servicos={servicos}
      />

      <div className="mb-6 inline-flex gap-1.5 rounded-xl bg-sunken p-1.5">
        {(
          [
            ["proximos", "Em aberto"],
            ["historico", "Histórico"],
          ] as const
        ).map(([valor, texto]) => (
          <Link
            key={valor}
            href={`/app/agendamentos?aba=${valor}`}
            scroll={false}
            className={`rounded-lg px-5 py-2 text-[0.85rem] font-semibold transition-colors ${
              aba === valor
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {texto}
          </Link>
        ))}
      </div>

      {agendamentos.length === 0 ? (
        <Vazio>
          {aba === "proximos" ? (
            <>
              Você não tem sessões futuras registradas.{" "}
              <Link
                href="/app/agendamentos/solicitar"
                className="font-semibold text-accent hover:underline"
              >
                Pedir horário pelo WhatsApp
              </Link>
            </>
          ) : (
            "Nenhuma sessão no histórico ainda."
          )}
        </Vazio>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {agendamentos.map((ag) => {
            const rotulo = ROTULO_STATUS[ag.status];
            const podeConfirmar = ag.status === "AGENDADO";
            const podeCancelar = ["AGENDADO", "CONFIRMADO"].includes(ag.status);
            const podeCheckin =
              ag.status === "CONFIRMADO" &&
              !ag.checkinEm &&
              ag.inicio.getTime() - agora.getTime() < 1000 * 60 * 60 * 24;
            // A sessão já passou mas ainda não foi confirmada pela clínica.
            // Quem credita os pontos é a administração, não o paciente.
            const aguardandoClinica =
              ag.inicio <= agora &&
              ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"].includes(ag.status);

            return (
              <li
                key={ag.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-surface p-5"
              >
                <div className="w-16 shrink-0 rounded-xl border border-line bg-sunken py-2.5 text-center">
                  <div className="font-serif text-[1.4rem] leading-none text-brand">
                    {diaMes(ag.inicio).dia}
                  </div>
                  <div className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-muted">
                    {diaMes(ag.inicio).mes}
                  </div>
                </div>

                <div className="min-w-[13rem] flex-1">
                  <h2 className="font-sans text-base font-semibold">
                    {ag.servico.nome}
                  </h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[0.84rem] text-muted">
                    <span>{hora(ag.inicio)}</span>
                    <span>{ag.profissional.nome}</span>
                    {rotulo ? (
                      <Pill
                        tom={
                          rotulo.tom as "success" | "warning" | "danger" | "muted"
                        }
                      >
                        {rotulo.texto}
                      </Pill>
                    ) : null}
                    {ag.checkinEm ? (
                      <Pill tom="success">
                        Check-in às {hora(ag.checkinEm)}
                      </Pill>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {aba === "proximos" && ag.inicio > agora ? (
                    <AdicionarAgenda
                      id={ag.id}
                      titulo={`${ag.servico.nome} — Vitapraxis`}
                      inicio={ag.inicio.toISOString()}
                      duracaoMin={ag.duracaoMin}
                      detalhes={`Com ${ag.profissional.nome}`}
                      googleLink={linkGoogleAgenda({
                        titulo: `${ag.servico.nome} — Vitapraxis`,
                        inicio: ag.inicio,
                        duracaoMin: ag.duracaoMin,
                        detalhes: `Com ${ag.profissional.nome}`,
                      })}
                    />
                  ) : null}

                  {aguardandoClinica ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-sunken px-4 py-2 text-[0.8rem] text-muted">
                      <IconeRelogio className="h-4 w-4" />
                      Aguardando a clínica confirmar
                    </span>
                  ) : null}

                  {podeCheckin ? (
                    <form action={fazerCheckin}>
                      <input type="hidden" name="id" value={ag.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-vp-green px-4 py-2 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                      >
                        <IconeQr className="h-4 w-4" />
                        Check-in
                      </button>
                    </form>
                  ) : null}

                  {podeConfirmar ? (
                    <form action={confirmarAgendamento}>
                      <input type="hidden" name="id" value={ag.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-vp-green px-4 py-2 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                      >
                        Confirmar
                      </button>
                    </form>
                  ) : null}

                  {podeCancelar ? (
                    <form action={cancelarAgendamento}>
                      <input type="hidden" name="id" value={ag.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-line px-4 py-2 text-[0.82rem] font-semibold transition-colors hover:border-danger hover:text-danger"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
