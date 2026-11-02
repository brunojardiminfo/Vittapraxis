import Link from "next/link";
import { db } from "@/lib/db";
import { regrasDoClube } from "@/lib/clube";
import { FormularioConfiguracao } from "./formulario";
import { Niveis, type NivelEditavel } from "./niveis";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regras do Clube" };

export default async function ConfiguracoesPage() {
  const [regras, niveis] = await Promise.all([
    regrasDoClube(),
    db.nivelClube.findMany({ orderBy: { minimo: "asc" } }),
  ]);

  const faixas: NivelEditavel[] = niveis.map((n) => ({
    id: n.id,
    nome: n.nome,
    minimo: n.minimo,
    beneficio: n.beneficio,
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
        <h1 className="text-[1.7rem]">Regras do Clube</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Tudo que o Clube promete sai daqui. A página pública e o portal do
          paciente leem os mesmos números, então nunca mostram coisas
          diferentes.
        </p>
      </header>

      <p className="mb-7 rounded-2xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
        Mudar uma regra vale de agora em diante: pontos e créditos já
        concedidos não são recalculados. Para corrigir o saldo de alguém, use
        o ajuste manual em Pacientes, que fica registrado com o motivo.
      </p>

      <div className="flex max-w-3xl flex-col gap-9">
        <FormularioConfiguracao regras={regras} />
        <Niveis niveis={faixas} />
      </div>
    </>
  );
}
