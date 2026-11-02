import { db } from "@/lib/db";
import { Eyebrow } from "@/components/ui";
import { IconePresente } from "@/components/icones";
import { FormularioVale, type ServicoOpcao } from "./formulario";

// Lê regras e serviços do banco: renderizar a cada visita faz a mudança
// do admin aparecer na hora, e tira o build da dependência do banco.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vale-presente Vitapraxis",
  description:
    "Presenteie com bem-estar: um valor livre ou uma sessão específica na Vitapraxis, em Auxiliadora, Porto Alegre.",
};

export default async function ValePresentePage() {
  const servicos = await db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    select: { id: true, nome: true, duracaoMin: true },
  });

  const opcoes: ServicoOpcao[] = servicos;

  return (
    <main>
      <section className="border-b border-line py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-vp-green text-[var(--on-brand)] dark:bg-vp-gold dark:text-vp-green-deep">
            <IconePresente className="h-6 w-6" />
          </div>
          <Eyebrow centro>Vale-presente</Eyebrow>
          <h1 className="text-[clamp(2rem,4vw,2.7rem)]">
            Dê de presente um momento de cuidado
          </h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
            Escolha um valor livre ou uma sessão específica. A gente registra
            o pedido e conversa com você pelo WhatsApp para acertar os
            detalhes e a forma de pagamento.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="rounded-3xl border border-line bg-surface p-7 sm:p-9">
            <FormularioVale servicos={opcoes} />
          </div>
        </div>
      </section>
    </main>
  );
}
