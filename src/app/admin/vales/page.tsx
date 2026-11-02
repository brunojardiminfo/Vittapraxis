import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta, moeda } from "@/lib/format";
import { linkWhatsapp } from "@/lib/whatsapp";
import { cancelarVale, usarVale } from "@/app/actions/vale";
import { Pill, Vazio } from "@/components/ui";
import { IconeChat, IconePresente } from "@/components/icones";
import { Emissao } from "./emissao";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vales-presente" };

const TOM: Record<string, "warning" | "success" | "muted" | "danger"> = {
  NOVO: "warning",
  EMITIDO: "success",
  USADO: "muted",
  CANCELADO: "danger",
};

const ROTULO: Record<string, string> = {
  NOVO: "A emitir",
  EMITIDO: "Emitido",
  USADO: "Usado",
  CANCELADO: "Cancelado",
};

export default async function ValesPage() {
  const [pedidos, pacientes] = await Promise.all([
    db.pedidoVale.findMany({
      orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
      include: {
        paciente: { include: { usuario: { select: { nome: true } } } },
      },
    }),
    db.paciente.findMany({
      orderBy: { usuario: { nome: "asc" } },
      select: { id: true, usuario: { select: { nome: true } } },
    }),
  ]);

  const opcoes = pacientes.map((p) => ({ id: p.id, nome: p.usuario.nome }));
  const novos = pedidos.filter((p) => p.status === "NOVO");
  const agora = new Date();

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
        <h1 className="text-[1.7rem]">Vales-presente</h1>
        <p className="mt-1 text-sm text-muted">
          {novos.length === 0
            ? "Nenhum vale aguardando emissão."
            : `${novos.length} ${novos.length === 1 ? "vale aguardando" : "vales aguardando"} emissão`}
        </p>
      </header>

      <p className="mb-6 rounded-2xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
        Emitir gera um código para quem recebe apresentar no balcão. Se a
        pessoa já for paciente, o vale também aparece no portal dela e some de
        lá quando for usado.
      </p>

      {pedidos.length === 0 ? (
        <Vazio>
          Ninguém pediu um vale-presente ainda. Os pedidos feitos em{" "}
          <Link
            href="/vale-presente"
            className="font-semibold text-accent hover:underline"
          >
            /vale-presente
          </Link>{" "}
          aparecem aqui.
        </Vazio>
      ) : (
        <ul className="flex flex-col gap-3">
          {pedidos.map((p) => {
            const vencido =
              p.status === "EMITIDO" && p.validoAte !== null && p.validoAte < agora;

            const zap = linkWhatsapp(
              p.deContato,
              p.codigo
                ? `Olá, ${p.deNome.split(" ")[0]}! Seu vale-presente da Vitapraxis para ${p.paraNome} está pronto. O código é ${p.codigo}${p.validoAte ? `, válido até ${dataCurta(p.validoAte)}` : ""}.`
                : `Olá, ${p.deNome.split(" ")[0]}! Aqui é da Vitapraxis, sobre o vale-presente para ${p.paraNome}.`
            );

            return (
              <li
                key={p.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-[17rem] flex-1 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-sunken text-accent">
                      <IconePresente className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-3">
                        <h2 className="font-sans text-[1rem] font-semibold">
                          {p.valor !== null
                            ? moeda(p.valor)
                            : (p.servicoNome ?? "Serviço")}
                        </h2>
                        <Pill tom={vencido ? "danger" : (TOM[p.status] ?? "muted")}>
                          {vencido ? "Vencido" : ROTULO[p.status]}
                        </Pill>
                        <span className="text-[0.78rem] text-muted">
                          {dataCurta(p.criadoEm)}
                        </span>
                      </div>

                      <p className="text-[0.86rem]">
                        <span className="text-muted">De</span> {p.deNome}{" "}
                        <span className="text-muted">para</span> {p.paraNome}
                      </p>

                      <p className="mt-1 text-[0.84rem] text-muted">
                        Contato: {p.deContato}
                      </p>

                      {p.codigo ? (
                        <p className="mt-2.5 inline-flex items-baseline gap-2.5 rounded-lg bg-sunken px-3.5 py-2">
                          <span className="font-serif text-[1.15rem] tracking-[0.1em] text-accent">
                            {p.codigo}
                          </span>
                          {p.validoAte ? (
                            <span className="text-[0.78rem] text-muted">
                              até {dataCurta(p.validoAte)}
                            </span>
                          ) : null}
                        </p>
                      ) : null}

                      {p.paciente ? (
                        <p className="mt-2 text-[0.8rem] text-muted">
                          No portal de{" "}
                          <Link
                            href={`/admin/pacientes/${p.paciente.id}`}
                            className="font-semibold text-accent hover:underline"
                          >
                            {p.paciente.usuario.nome}
                          </Link>
                        </p>
                      ) : null}

                      {p.usadoEm ? (
                        <p className="mt-1.5 text-[0.8rem] text-muted">
                          Usado em {dataCurta(p.usadoEm)}
                          {p.usadoPor ? ` por ${p.usadoPor}` : ""}
                        </p>
                      ) : null}

                      {p.mensagem ? (
                        <p className="mt-2.5 rounded-lg bg-sunken px-3.5 py-2.5 text-[0.85rem] italic">
                          &ldquo;{p.mensagem}&rdquo;
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    {zap ? (
                      <a
                        href={zap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                      >
                        <IconeChat className="h-4 w-4" />
                        {p.codigo ? "Enviar código" : "WhatsApp"}
                      </a>
                    ) : (
                      <a
                        href={`mailto:${p.deContato}`}
                        className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                      >
                        E-mail
                      </a>
                    )}

                    {p.status === "EMITIDO" && !vencido ? (
                      <form action={usarVale}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-success hover:text-success"
                        >
                          Marcar como usado
                        </button>
                      </form>
                    ) : null}

                    {p.status !== "USADO" && p.status !== "CANCELADO" ? (
                      <form action={cancelarVale}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {p.status === "NOVO" ? (
                  <Emissao
                    id={p.id}
                    pacientes={opcoes}
                    paraNome={p.paraNome}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
