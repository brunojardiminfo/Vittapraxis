import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta, haQuantoTempo, moeda } from "@/lib/format";
import { linkWhatsapp } from "@/lib/whatsapp";
import { regrasDoClube, nivelDe } from "@/lib/clube";
import { Pill, Vazio } from "@/components/ui";
import { IconeChat } from "@/components/icones";
import { AjusteClube } from "./ajuste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pacientes" };

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const { busca } = await searchParams;
  const termo = busca?.trim() ?? "";

  const [pacientes, regras] = await Promise.all([
    db.paciente.findMany({
      where: termo
        ? {
            OR: [
              { usuario: { nome: { contains: termo, mode: "insensitive" } } },
              { usuario: { email: { contains: termo, mode: "insensitive" } } },
              { telefone: { contains: termo } },
              { whatsapp: { contains: termo } },
              { codigoIndicacao: { contains: termo, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { usuario: { nome: "asc" } },
      include: {
        usuario: { select: { nome: true, email: true, ultimoAcesso: true } },
        _count: { select: { agendamentos: true, indicacoes: true } },
        agendamentos: {
          where: { status: "CONCLUIDO" },
          orderBy: { inicio: "desc" },
          take: 1,
          select: { inicio: true },
        },
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

      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem]">Pacientes</h1>
          <p className="mt-1 text-sm text-muted">
            {pacientes.length}{" "}
            {pacientes.length === 1 ? "cadastro" : "cadastros"}
            {termo ? ` para “${termo}”` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/pacientes/novo"
            className="rounded-full bg-vp-green px-5 py-2.5 text-[0.84rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
          >
            Novo paciente
          </Link>

          {/* Busca por GET: mantém o resultado na URL, dá para compartilhar */}
          <form className="flex gap-2">
            <input
              name="busca"
              defaultValue={termo}
              placeholder="Nome, e-mail, telefone ou código"
              className="w-64 rounded-full border border-line bg-surface px-5 py-2.5 text-[0.86rem] outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Buscar
            </button>
          </form>
        </div>
      </header>

      {pacientes.length === 0 ? (
        <Vazio>
          {termo
            ? "Nenhum paciente encontrado com esse termo."
            : "Nenhum paciente cadastrado ainda."}
        </Vazio>
      ) : (
        <ul className="flex flex-col gap-3">
          {pacientes.map((p) => {
            const zap = linkWhatsapp(
              p.whatsapp ?? p.telefone,
              `Olá, ${p.usuario.nome.split(" ")[0]}! Aqui é da Vitapraxis.`
            );
            const { atual } = nivelDe(p.pontos, regras);

            return (
              <li
                key={p.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-[16rem] flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-3">
                      <h2 className="font-sans text-[1rem] font-semibold">
                        <Link
                          href={`/admin/pacientes/${p.id}`}
                          className="transition-colors hover:text-accent"
                        >
                          {p.usuario.nome}
                        </Link>
                      </h2>
                      <Pill tom={p.consentimentoLgpd ? "success" : "warning"}>
                        {p.consentimentoLgpd ? "LGPD ok" : "LGPD pendente"}
                      </Pill>
                    </div>

                    <dl className="grid gap-x-8 gap-y-1.5 text-[0.84rem] sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="text-muted">E-mail:</dt>
                        <dd className="min-w-0 truncate">
                          <a
                            href={`mailto:${p.usuario.email}`}
                            className="text-accent hover:underline"
                          >
                            {p.usuario.email}
                          </a>
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted">Telefone:</dt>
                        <dd>{p.telefone ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted">WhatsApp:</dt>
                        <dd>{p.whatsapp ?? "não informado"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted">Nascimento:</dt>
                        <dd>
                          {p.dataNascimento
                            ? dataCurta(p.dataNascimento)
                            : "—"}
                        </dd>
                      </div>
                      <div className="flex gap-2 sm:col-span-2">
                        <dt className="text-muted">Endereço:</dt>
                        <dd>{p.endereco ?? "—"}</dd>
                      </div>
                      {p.emergenciaNome ? (
                        <div className="flex gap-2 sm:col-span-2">
                          <dt className="text-muted">Emergência:</dt>
                          <dd>
                            {p.emergenciaNome}
                            {p.emergenciaVinculo
                              ? ` (${p.emergenciaVinculo})`
                              : ""}
                            {p.emergenciaFone ? ` · ${p.emergenciaFone}` : ""}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    {zap ? (
                      <a
                        href={zap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-vp-green px-5 py-2.5 text-[0.82rem] font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep dark:bg-vp-gold dark:text-vp-green-deep"
                      >
                        <IconeChat className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : (
                      <span className="rounded-full border border-dashed border-line px-5 py-2.5 text-[0.8rem] text-muted">
                        Sem WhatsApp
                      </span>
                    )}
                    <Link
                      href={`/admin/pacientes/${p.id}`}
                      className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      Abrir ficha
                    </Link>
                    <AjusteClube
                      id={p.id}
                      nome={p.usuario.nome}
                      pontos={p.pontos}
                      cashback={p.cashback}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 border-t border-line pt-3.5 text-[0.82rem] text-muted">
                  <span>
                    Clube:{" "}
                    <strong className="font-semibold text-ink">
                      {atual.nome}
                    </strong>{" "}
                    · {p.pontos.toLocaleString("pt-BR")} pts
                  </span>
                  <span>
                    Cashback:{" "}
                    <strong className="font-semibold text-ink">
                      {moeda(p.cashback)}
                    </strong>
                  </span>
                  <span>
                    Código:{" "}
                    <span className="font-semibold tracking-wider text-accent">
                      {p.codigoIndicacao}
                    </span>
                  </span>
                  <span>{p._count.agendamentos} sessões registradas</span>
                  <span>
                    Última sessão:{" "}
                    <strong className="font-semibold text-ink">
                      {p.agendamentos[0]
                        ? haQuantoTempo(p.agendamentos[0].inicio)
                        : "nenhuma"}
                    </strong>
                  </span>
                  <span>
                    Acessou:{" "}
                    <strong className="font-semibold text-ink">
                      {haQuantoTempo(p.usuario.ultimoAcesso) ?? "nunca"}
                    </strong>
                  </span>
                  <span>{p._count.indicacoes} indicações</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
