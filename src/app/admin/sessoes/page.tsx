import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta, hora } from "@/lib/format";
import { regrasDoClube, pontosDoServico } from "@/lib/clube";
import { concluirSessao, cancelarPelaClinica } from "@/app/actions/agendamentos";
import { Pill, Vazio } from "@/components/ui";
import { IconeCheck } from "@/components/icones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirmar Sessões" };

export default async function AdminSessoesPage() {
  const agora = new Date();

  const [pendentes, regras] = await Promise.all([
    // Já passou da hora e ninguém encerrou: é o que espera a palavra da
    // clínica para virar ponto no Clube.
    db.agendamento.findMany({
      where: {
        inicio: { lte: agora },
        status: { in: ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"] },
      },
      orderBy: { inicio: "desc" },
      include: {
        servico: true,
        profissional: { select: { nome: true } },
        paciente: { include: { usuario: { select: { nome: true } } } },
      },
    }),
    regrasDoClube(),
  ]);

  return (
    <>
      <nav className="mb-5">
        <Link
          href="/admin"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Visão geral
        </Link>
      </nav>

      <header className="mb-7">
        <h1 className="text-[1.7rem]">Confirmar Sessões</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {pendentes.length === 0
            ? "Nenhuma sessão esperando confirmação."
            : `${pendentes.length} ${
                pendentes.length === 1
                  ? "sessão já aconteceu e espera"
                  : "sessões já aconteceram e esperam"
              } sua confirmação`}
        </p>
      </header>

      <p className="mb-6 rounded-2xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
        O paciente registra a sessão, mas quem confirma é a clínica — ponto
        vira cashback e nível, então a conta não pode depender de quem recebe o
        benefício. Ao confirmar, os pontos entram na hora, e se a pessoa veio
        por indicação, o cashback de quem indicou é liberado junto.
      </p>

      {pendentes.length === 0 ? (
        <Vazio>Tudo em dia. Sessões futuras aparecem aqui depois da hora.</Vazio>
      ) : (
        <ul className="flex flex-col gap-3">
          {pendentes.map((ag) => {
            const pontos = pontosDoServico(ag.servico, regras);
            const atrasoDias = Math.floor(
              (agora.getTime() - ag.inicio.getTime()) / 86_400_000
            );

            return (
              <li
                key={ag.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-surface p-5"
              >
                <div className="min-w-[16rem] flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-3">
                    <h2 className="font-sans text-[1rem] font-semibold">
                      {ag.paciente.usuario.nome}
                    </h2>
                    <Pill tom={atrasoDias >= 3 ? "warning" : "muted"}>
                      {atrasoDias === 0
                        ? "hoje"
                        : `há ${atrasoDias} ${atrasoDias === 1 ? "dia" : "dias"}`}
                    </Pill>
                  </div>
                  <p className="text-[0.86rem] text-muted">
                    {ag.servico.nome} · {dataCurta(ag.inicio)} às{" "}
                    {hora(ag.inicio)} · {ag.profissional.nome}
                  </p>
                  <p className="mt-1 text-[0.82rem] text-muted">
                    Confirmar credita{" "}
                    <strong className="font-semibold text-accent">
                      {pontos} pontos
                    </strong>{" "}
                    para o paciente.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <form action={concluirSessao}>
                    <input type="hidden" name="id" value={ag.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                    >
                      <IconeCheck className="h-4 w-4" />
                      Aconteceu
                    </button>
                  </form>

                  <form action={cancelarPelaClinica}>
                    <input type="hidden" name="id" value={ag.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-line px-5 py-2.5 text-[0.82rem] font-semibold transition-colors hover:border-danger hover:text-danger"
                    >
                      Não veio
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
