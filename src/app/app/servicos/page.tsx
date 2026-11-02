import { db } from "@/lib/db";
// Valores e duração saíram do portal a pedido da clínica
import { BotaoLink } from "@/components/ui";
import { IconeCheck } from "@/components/icones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catálogo de Serviços" };

export default async function ServicosPage() {
  const servicos = await db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    include: {
      profissionais: { select: { nome: true } },
    },
  });

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Catálogo de Serviços</h1>
        <p className="mt-1 text-sm text-muted">
          Benefícios, duração e profissionais de cada especialidade
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {servicos.map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="mb-3 text-[1.15rem]">{s.nome}</h2>

            <p className="mb-4 text-[0.9rem] leading-relaxed text-muted">
              {s.descricao}
            </p>

            <ul className="mb-5 flex flex-col gap-1.5">
              {s.beneficios.split("|").map((b) => (
                <li key={b} className="flex items-start gap-2 text-[0.86rem]">
                  <IconeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t border-line pt-4">
              <p className="mb-3 text-[0.78rem] text-muted">
                <span className="font-semibold text-ink">Com: </span>
                {s.profissionais.map((p) => p.nome).join(" · ")}
              </p>
              <BotaoLink
                href={`/app/agendamentos/solicitar?servico=${s.id}`}
                tamanho="sm"
              >
                Solicitar agendamento
              </BotaoLink>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
