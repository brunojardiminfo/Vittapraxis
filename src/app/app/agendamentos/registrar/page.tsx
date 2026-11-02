import Link from "next/link";
import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { FormularioSessao, type ServicoOpcao } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Registrar Sessão" };

export default async function RegistrarPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico: servicoInicial } = await searchParams;
  await pacienteDaSessao();

  const servicos = await db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    include: { profissionais: { select: { id: true, nome: true } } },
  });

  const opcoes: ServicoOpcao[] = servicos.map((s) => ({
    id: s.id,
    nome: s.nome,
    duracaoMin: s.duracaoMin,
    profissionais: s.profissionais,
  }));

  return (
    <>
      <nav className="mb-5">
        <Link
          href="/app/agendamentos"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Meus agendamentos
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-[1.9rem]">Registrar Sessão</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Já combinou o horário pelo WhatsApp? Registre aqui para acompanhar na
          sua agenda e responder o Índice de Bem-Estar antes da sessão.
        </p>
      </header>

      <div className="max-w-2xl rounded-3xl border border-line bg-surface p-7 sm:p-9">
        <FormularioSessao servicos={opcoes} servicoInicial={servicoInicial} />
      </div>
    </>
  );
}
