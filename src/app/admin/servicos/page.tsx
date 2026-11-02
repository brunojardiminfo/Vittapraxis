import Link from "next/link";
import { db } from "@/lib/db";
import { regrasDoClube } from "@/lib/clube";
import { Vazio } from "@/components/ui";
import { FormularioServico, type ServicoEditavel } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Serviços" };

export default async function AdminServicosPage() {
  const [servicos, regras] = await Promise.all([
    db.servico.findMany({ orderBy: { ordem: "asc" } }),
    regrasDoClube(),
  ]);

  const opcoes: ServicoEditavel[] = servicos.map((s) => ({
    id: s.id,
    nome: s.nome,
    categoria: s.categoria,
    precoPromocional: s.precoPromocional,
    precoAvulso: s.precoAvulso,
    precoEmPlano: s.precoEmPlano,
    pontos: s.pontos,
    ativo: s.ativo,
    exibirPreco: s.exibirPreco,
    exibirPromocional: s.exibirPromocional,
  }));

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
        <h1 className="text-[1.7rem]">Serviços</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Valores e pontos do Clube. O que você salvar aqui vale para
          o site, a página de especialidades e o portal do paciente ao mesmo
          tempo — os três leem daqui.
        </p>
      </header>

      <p className="mb-6 rounded-2xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
        Os valores não aparecem no site público — lá a pessoa é convidada a
        falar com a recepção. No portal do paciente, cada serviço mostra o
        valor e o promocional só se as caixas abaixo estiverem marcadas.
      </p>

      {opcoes.length === 0 ? (
        <Vazio>Nenhum serviço cadastrado.</Vazio>
      ) : (
        <div className="flex flex-col gap-4">
          {opcoes.map((s) => (
            <FormularioServico
              key={s.id}
              servico={s}
              pontosPadrao={regras.pontosPorSessao}
            />
          ))}
        </div>
      )}
    </>
  );
}
