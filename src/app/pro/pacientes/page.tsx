import Link from "next/link";
import { db } from "@/lib/db";
import { haQuantoTempo } from "@/lib/format";
import { idade } from "@/lib/profissional";
import { Vazio } from "@/components/ui";
import { BuscaPaciente } from "../busca";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pacientes" };

export default async function ProPacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const termo = q?.trim() ?? "";

  // Qualquer profissional enxerga a base inteira: o paciente passa por mais
  // de uma especialidade, e a ficha precisa estar à mão de quem for atender
  const pacientes = await db.paciente.findMany({
    where: termo
      ? { usuario: { nome: { contains: termo, mode: "insensitive" } } }
      : undefined,
    orderBy: { usuario: { nome: "asc" } },
    take: 60,
    include: {
      usuario: { select: { nome: true } },
      agendamentos: {
        where: { status: "CONCLUIDO" },
        orderBy: { inicio: "desc" },
        take: 1,
        select: { inicio: true },
      },
    },
  });

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[1.9rem]">Pacientes</h1>
        <p className="mt-1 text-sm text-muted">
          {termo
            ? `${pacientes.length} ${pacientes.length === 1 ? "resultado" : "resultados"} para “${termo}”`
            : "Busque pelo nome para abrir a ficha"}
        </p>
      </header>

      <div className="mb-6">
        <BuscaPaciente inicial={termo} />
      </div>

      {pacientes.length === 0 ? (
        <Vazio>
          Ninguém com esse nome. Pacientes novos são cadastrados pela
          administração.
        </Vazio>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pacientes.map((p) => {
            const anos = idade(p.dataNascimento);
            const ultima = p.agendamentos[0]?.inicio;
            return (
              <li key={p.id}>
                <Link
                  href={`/pro/pacientes/${p.id}`}
                  className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
                >
                  <p className="font-sans text-[0.98rem] font-semibold">
                    {p.usuario.nome}
                  </p>
                  <p className="mt-1 text-[0.8rem] text-muted">
                    {anos !== null ? `${anos} anos · ` : ""}
                    {ultima
                      ? `última sessão ${haQuantoTempo(ultima)}`
                      : "sem sessões ainda"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
