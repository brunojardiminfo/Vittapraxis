import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta, moeda } from "@/lib/format";
import { linkWhatsapp } from "@/lib/whatsapp";
import { CLINICA } from "@/lib/clinica";
import { regrasDoClube } from "@/lib/clube";
import {
  cancelarVoucher,
  emitirVouchersAniversario,
  expirarVencidos,
} from "@/app/actions/vouchers";
import { Pill, Vazio } from "@/components/ui";
import { IconeChat, IconePresente } from "@/components/icones";
import { Resgate } from "./resgate";
import { EmitirVoucher } from "./emitir";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vouchers" };

const TOM: Record<string, "success" | "muted" | "danger"> = {
  DISPONIVEL: "success",
  USADO: "muted",
  EXPIRADO: "danger",
  CANCELADO: "muted",
};

const ROTULO_STATUS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  USADO: "Usado",
  EXPIRADO: "Vencido",
  CANCELADO: "Cancelado",
};

const ROTULO_TIPO: Record<string, string> = {
  ANIVERSARIO: "Aniversário",
  INDICACAO: "Indicação",
  CORTESIA: "Cortesia",
};

export default async function VouchersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filtro = status ?? "DISPONIVEL";

  const [pacientes, servicos, regras] = await Promise.all([
    db.paciente.findMany({
      orderBy: { usuario: { nome: "asc" } },
      select: { id: true, usuario: { select: { nome: true } } },
    }),
    db.servico.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      select: { id: true, nome: true },
    }),
    regrasDoClube(),
  ]);

  const vouchers = await db.voucher.findMany({
    where: filtro === "TODOS" ? undefined : { status: filtro },
    orderBy: [{ status: "asc" }, { validoAte: "asc" }],
    include: {
      paciente: {
        include: { usuario: { select: { nome: true } } },
      },
      servico: { select: { nome: true } },
    },
  });

  const agora = new Date();
  const disponiveis = await db.voucher.count({
    where: { status: "DISPONIVEL" },
  });

  const abas = [
    ["DISPONIVEL", "Disponíveis"],
    ["USADO", "Usados"],
    ["EXPIRADO", "Vencidos"],
    ["TODOS", "Todos"],
  ] as const;

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

      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem]">Vouchers</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            {disponiveis === 0
              ? "Nenhum voucher disponível no momento."
              : `${disponiveis} ${disponiveis === 1 ? "voucher disponível" : "vouchers disponíveis"} para resgate`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <EmitirVoucher
            pacientes={pacientes.map((p) => ({
              id: p.id,
              nome: p.usuario.nome,
            }))}
            servicos={servicos}
            faixas={regras.niveis.map((n) => n.nome)}
          />
          <form action={emitirVouchersAniversario}>
            <button
              type="submit"
              className="rounded-full bg-vp-green px-5 py-2.5 text-[0.84rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
            >
              Emitir aniversários do mês
            </button>
          </form>
          <form action={expirarVencidos}>
            <button
              type="submit"
              className="rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Fechar vencidos
            </button>
          </form>
        </div>
      </header>

      <p className="mb-6 rounded-2xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
        Emitir aniversários cria um voucher para cada paciente que faz
        aniversário neste mês, válido até o último dia. Rodar de novo não
        duplica — quem já recebeu no ano é pulado.
      </p>

      <div className="mb-6 inline-flex flex-wrap gap-1.5 rounded-xl bg-sunken p-1.5">
        {abas.map(([valor, texto]) => (
          <Link
            key={valor}
            href={`/admin/vouchers?status=${valor}`}
            scroll={false}
            className={`rounded-lg px-5 py-2 text-[0.85rem] font-semibold transition-colors ${
              filtro === valor
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {texto}
          </Link>
        ))}
      </div>

      {vouchers.length === 0 ? (
        <Vazio>Nenhum voucher nesta aba.</Vazio>
      ) : (
        <ul className="flex flex-col gap-3">
          {vouchers.map((v) => {
            const vencido = v.status === "DISPONIVEL" && v.validoAte < agora;
            // O aviso já leva o que o voucher dá e até quando: a pessoa não
            // precisa abrir o portal para saber se vale a pena marcar
            const beneficio = [
              v.valor ? `${moeda(v.valor)} de crédito` : null,
              v.percentual ? `${v.percentual}% de desconto` : null,
              v.servico ? `em ${v.servico.nome}` : null,
            ]
              .filter(Boolean)
              .join(" ");
            const zap = linkWhatsapp(
              v.paciente.whatsapp ?? v.paciente.telefone,
              `Olá, ${v.paciente.usuario.nome.split(" ")[0]}! Aqui é da Vitapraxis 🌿\n\n` +
                `Você ganhou um voucher: *${v.titulo}*` +
                (beneficio ? ` — ${beneficio}` : "") +
                `.\nVale até ${dataCurta(v.validoAte)}.\n\n` +
                `Veja no seu portal: ${CLINICA.site}/app/beneficios\n` +
                `Quer agendar? É só responder esta mensagem.`
            );

            return (
              <li
                key={v.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-[17rem] flex-1 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-sunken text-accent">
                      <IconePresente className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-3">
                        <h2 className="font-sans text-[0.98rem] font-semibold">
                          {v.titulo}
                        </h2>
                        <Pill tom={vencido ? "danger" : (TOM[v.status] ?? "muted")}>
                          {vencido ? "Vencido" : ROTULO_STATUS[v.status]}
                        </Pill>
                        <span className="text-[0.76rem] text-muted">
                          {ROTULO_TIPO[v.tipo] ?? v.tipo}
                        </span>
                      </div>

                      <p className="text-[0.86rem]">
                        {v.paciente.usuario.nome}
                        {v.valor ? ` · ${moeda(v.valor)}` : ""}
                        {v.percentual ? ` · ${v.percentual}% de desconto` : ""}
                        {v.servico ? ` · ${v.servico.nome}` : ""}
                      </p>

                      <p className="mt-1 text-[0.82rem] text-muted">
                        Vale até {dataCurta(v.validoAte)}
                        {v.usadoEm
                          ? ` · usado em ${dataCurta(v.usadoEm)}${v.usadoPor ? ` por ${v.usadoPor}` : ""}`
                          : ""}
                      </p>

                      {v.descricao ? (
                        <p className="mt-2 whitespace-pre-line text-[0.82rem] leading-relaxed text-muted">
                          {v.descricao}
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
                        Avisar
                      </a>
                    ) : null}

                    {v.status === "DISPONIVEL" && !vencido ? (
                      <form action={cancelarVoucher}>
                        <input type="hidden" name="id" value={v.id} />
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

                {v.status === "DISPONIVEL" && !vencido ? (
                  <Resgate id={v.id} temValor={!!v.valor} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
