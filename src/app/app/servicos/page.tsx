import { db } from "@/lib/db";
import { moeda } from "@/lib/format";
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
          Benefícios e profissionais de cada especialidade
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {servicos.map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="mb-3 text-[1.15rem]">{s.nome}</h2>

            <Preco servico={s} />

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

/**
 * Valor no portal, só quando a clínica liga a exibição no admin.
 *
 * O promocional aparece com o avulso riscado ao lado — se o avulso estiver
 * escondido, o promocional aparece sozinho, sem a comparação.
 */
function Preco({
  servico,
}: {
  servico: {
    precoAvulso: number;
    precoPromocional: number | null;
    exibirPreco: boolean;
    exibirPromocional: boolean;
  };
}) {
  const promo =
    servico.exibirPromocional && servico.precoPromocional !== null
      ? servico.precoPromocional
      : null;

  if (promo === null && !servico.exibirPreco) return null;

  return (
    <p className="-mt-1 mb-4 flex flex-wrap items-baseline gap-2.5">
      {promo !== null ? (
        <>
          <span className="rounded-full bg-success-bg px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-success">
            Promoção
          </span>
          <span className="font-serif text-[1.35rem] text-brand">
            {moeda(promo)}
          </span>
          {servico.exibirPreco ? (
            <span className="text-[0.86rem] text-muted line-through">
              {moeda(servico.precoAvulso)}
            </span>
          ) : null}
        </>
      ) : (
        <span className="font-serif text-[1.35rem] text-brand">
          {moeda(servico.precoAvulso)}
        </span>
      )}
      <span className="text-[0.78rem] text-muted">por sessão</span>
    </p>
  );
}
