import Link from "next/link";
import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { FormularioPedido, type ServicoOpcao } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedir Horário" };

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico: servicoInicial } = await searchParams;
  await pacienteDaSessao();

  const servicos = await db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    include: {
      profissionais: { select: { id: true, nome: true } },
    },
  });

  const opcoes: ServicoOpcao[] = servicos.map((s) => ({
    id: s.id,
    nome: s.nome,
    duracaoMin: s.duracaoMin,
    precoAvulso: s.precoAvulso,
    precoEmPlano: s.precoEmPlano,
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
        <h1 className="text-[1.9rem]">Pedir Horário</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Conte o que você precisa e suas preferências. Ao continuar, abrimos
          o WhatsApp da clínica com a mensagem pronta para a recepção.
        </p>
      </header>

      <div className="max-w-3xl rounded-3xl border border-line bg-surface p-7 sm:p-9">
        <FormularioPedido
          servicos={opcoes}
          servicoInicial={servicoInicial}
        />
      </div>
    </>
  );
}
