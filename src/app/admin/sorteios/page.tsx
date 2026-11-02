import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta } from "@/lib/format";
import { regrasDoClube } from "@/lib/clube";
import {
  apurarSorteio,
  cancelarSorteio,
  excluirSorteio,
  participantesDe,
} from "@/app/actions/sorteios";
import { Pill, Vazio } from "@/components/ui";
import { IconeEstrela } from "@/components/icones";
import { FormularioSorteio } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sorteios" };

const TOM: Record<string, "warning" | "success" | "muted"> = {
  ABERTO: "warning",
  SORTEADO: "success",
  CANCELADO: "muted",
};

/** Quantos concorrem agora — só faz sentido enquanto o sorteio está aberto. */
async function Concorrendo({ id }: { id: string }) {
  const lista = await participantesDe(id);
  return (
    <p className="mt-2 text-[0.84rem] text-muted">
      {lista.length === 0 ? (
        "Ninguém concluiu sessão no período ainda."
      ) : (
        <>
          <strong className="font-semibold text-accent">{lista.length}</strong>{" "}
          {lista.length === 1 ? "paciente concorrendo" : "pacientes concorrendo"}
          {lista.length <= 6 ? (
            <span> · {lista.map((p) => p.usuario.nome).join(", ")}</span>
          ) : null}
        </>
      )}
    </p>
  );
}

export default async function SorteiosPage() {
  const [sorteios, regras] = await Promise.all([
    db.sorteio.findMany({
      orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
      include: { ganhador: { include: { usuario: { select: { nome: true } } } } },
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
        <h1 className="text-[1.7rem]">Sorteios do Clube</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          O sistema sorteia entre quem se tratou no período e guarda quantos
          concorriam, quem ganhou e quem apurou.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <FormularioSorteio niveis={regras.niveis.map((n) => n.nome)} />

        <section>
          <h2 className="mb-4 text-[1.15rem]">
            Histórico{" "}
            <span className="text-[0.85rem] font-normal text-muted">
              ({sorteios.length})
            </span>
          </h2>

          {sorteios.length === 0 ? (
            <Vazio>Nenhum sorteio criado ainda.</Vazio>
          ) : (
            <ul className="flex flex-col gap-3">
              {sorteios.map((s) => (
                <li
                  key={s.id}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-3">
                    <h3 className="font-sans text-[0.98rem] font-semibold">
                      {s.titulo}
                    </h3>
                    <Pill tom={TOM[s.status] ?? "muted"}>
                      {s.status === "ABERTO"
                        ? "Aberto"
                        : s.status === "SORTEADO"
                          ? "Sorteado"
                          : "Cancelado"}
                    </Pill>
                  </div>

                  <p className="text-[0.86rem] text-muted">
                    {s.premio} · {dataCurta(s.inicioEm)} a {dataCurta(s.fimEm)}
                    {s.nivelMinimo ? ` · ${s.nivelMinimo} ou acima` : ""}
                  </p>

                  {s.status === "ABERTO" ? <Concorrendo id={s.id} /> : null}

                  {s.status === "SORTEADO" && s.ganhador ? (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-success-bg px-4 py-3">
                      <IconeEstrela className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <p className="text-[0.86rem] leading-relaxed text-success">
                        <strong className="font-semibold">
                          {s.ganhador.usuario.nome}
                        </strong>{" "}
                        ganhou entre {s.participantes}{" "}
                        {s.participantes === 1 ? "participante" : "participantes"}
                        {s.sorteadoEm
                          ? ` · apurado em ${dataCurta(s.sorteadoEm)}`
                          : ""}
                        {s.sorteadoPor ? ` por ${s.sorteadoPor}` : ""}.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {s.status === "ABERTO" ? (
                      <>
                        <form action={apurarSorteio}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-vp-green px-5 py-2.5 text-[0.8rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                          >
                            Sortear agora
                          </button>
                        </form>
                        <form action={cancelarSorteio}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-line px-4 py-2.5 text-[0.8rem] font-semibold transition-colors hover:border-danger hover:text-danger"
                          >
                            Cancelar
                          </button>
                        </form>
                      </>
                    ) : (
                      <form action={excluirSorteio}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-line px-4 py-2.5 text-[0.8rem] font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                          Excluir do histórico
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
