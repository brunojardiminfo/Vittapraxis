import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { profissionalId } from "@/lib/profissional";
import { dataCurta, hora } from "@/lib/format";
import { FormularioAtendimento } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Registrar atendimento" };

export default async function AtenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ agendamento?: string }>;
}) {
  const [{ id }, { agendamento }, meuId] = await Promise.all([
    params,
    searchParams,
    profissionalId(),
  ]);

  const fimDeHoje = new Date();
  fimDeHoje.setHours(23, 59, 59, 999);

  const [paciente, pro, sessoes] = await Promise.all([
    db.paciente.findUnique({
      where: { id },
      select: {
        id: true,
        fichaClinica: true,
        usuario: { select: { nome: true } },
        evolucoes: {
          orderBy: { criadoEm: "desc" },
          take: 1,
          select: { regioesDor: true, orientacoes: true, criadoEm: true },
        },
      },
    }),
    db.profissional.findUnique({
      where: { id: meuId },
      select: { servicos: { where: { ativo: true }, select: { id: true, nome: true } } },
    }),
    // Sessões deste paciente com este profissional, até hoje, ainda sem
    // evolução: é nelas que o atendimento se encaixa
    db.agendamento.findMany({
      where: {
        pacienteId: id,
        profissionalId: meuId,
        status: { not: "CANCELADO" },
        inicio: { lte: fimDeHoje },
        evolucao: null,
      },
      orderBy: { inicio: "desc" },
      take: 10,
      include: { servico: { select: { nome: true } } },
    }),
  ]);
  if (!paciente) notFound();

  // Quem atende serviço que não está vinculado a ele ainda precisa registrar:
  // sem serviço vinculado, oferece o catálogo inteiro
  const servicos =
    pro && pro.servicos.length > 0
      ? pro.servicos
      : await db.servico.findMany({
          where: { ativo: true },
          orderBy: { ordem: "asc" },
          select: { id: true, nome: true },
        });

  const anterior = paciente.evolucoes[0];

  return (
    <>
      <nav className="mb-5">
        <Link
          href={`/pro/pacientes/${paciente.id}`}
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Ficha de {paciente.usuario.nome.split(" ")[0]}
        </Link>
      </nav>

      <header className="mb-7">
        <h1 className="text-[1.9rem]">Registrar atendimento</h1>
        <p className="mt-1 text-sm text-muted">{paciente.usuario.nome}</p>
      </header>

      {paciente.fichaClinica || anterior?.orientacoes ? (
        <section className="mb-7 grid gap-4 md:grid-cols-2">
          {paciente.fichaClinica ? (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
                Ficha clínica
              </p>
              <p className="line-clamp-[8] whitespace-pre-line text-[0.86rem] leading-relaxed">
                {paciente.fichaClinica}
              </p>
            </div>
          ) : null}
          {anterior?.orientacoes ? (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
                Orientações da última sessão · {dataCurta(anterior.criadoEm)}
              </p>
              <p className="whitespace-pre-line text-[0.86rem] leading-relaxed">
                {anterior.orientacoes}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <FormularioAtendimento
        pacienteId={paciente.id}
        sessoes={sessoes.map((s) => ({
          id: s.id,
          rotulo: `${dataCurta(s.inicio)} às ${hora(s.inicio)} · ${s.servico.nome}`,
        }))}
        sessaoInicial={
          sessoes.some((s) => s.id === agendamento) ? agendamento! : sessoes[0]?.id ?? ""
        }
        servicos={servicos}
      />
    </>
  );
}
