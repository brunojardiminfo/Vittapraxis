import Image from "next/image";
import { db } from "@/lib/db";
import { ESPECIALIDADES } from "@/lib/especialidades";
import { CLINICA } from "@/lib/clinica";
import { BotaoLink, Eyebrow } from "@/components/ui";
import { IconeCheck } from "@/components/icones";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Especialidades",
  description:
    "Quiropraxia, Massoterapia, Liberação Miofascial, Acupuntura, Nutrição, Fisioterapia ATM e Iridologia — o que cada especialidade trata e como funciona, na Vitapraxis em Auxiliadora, Porto Alegre.",
};

export default async function EspecialidadesPage() {
  const servicos = await db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    include: { profissionais: { select: { nome: true } } },
  });

  // Cruza o texto editorial com preço, duração e quem atende
  const porNome = new Map(servicos.map((s) => [s.nome, s]));

  return (
    <main>
      {/* ---------------- ABERTURA ---------------- */}
      <section className="border-b border-line bg-sunken py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Eyebrow>Especialidades</Eyebrow>
          <h1 className="max-w-3xl text-[clamp(2rem,3.6vw,2.8rem)]">
            Cuidado integrado, especialidade por especialidade
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
            Cada área tem seu próprio olhar sobre o mesmo objetivo: devolver
            movimento, aliviar dor e sustentar o resultado no dia a dia.
          </p>

          <nav className="mt-9 flex flex-wrap gap-2.5">
            {ESPECIALIDADES.map((e) => (
              <a
                key={e.slug}
                href={`#${e.slug}`}
                className="rounded-full border border-line bg-surface px-5 py-2.5 text-[0.85rem] font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                {e.titulo}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ---------------- CADA ESPECIALIDADE ---------------- */}
      {ESPECIALIDADES.map((e, i) => {
        const servico = porNome.get(e.servicoNome);
        const par = i % 2 === 1;

        return (
          <section
            key={e.slug}
            id={e.slug}
            className={`scroll-mt-20 border-b border-line py-20 ${
              par ? "bg-sunken" : ""
            }`}
          >
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              {/* Cabeçalho da especialidade */}
              <div
                className={`mb-12 grid items-center gap-12 ${
                  e.foto ? "lg:grid-cols-[1.05fr_0.95fr]" : ""
                }`}
              >
                <div className={par && e.foto ? "lg:order-2" : ""}>
                  {e.selo ? (
                    <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-accent">
                      {e.selo}
                    </p>
                  ) : null}
                  <h2 className="text-[clamp(1.8rem,3.2vw,2.5rem)]">
                    {e.titulo}
                  </h2>
                  <p className="mt-3 max-w-lg text-[1.05rem] leading-relaxed text-muted">
                    {e.chamada}
                  </p>

                  {/* Duração saiu a pedido da clínica: varia conforme o caso,
                      e o número fixo virava promessa. Valor também é da
                      recepção, montado junto com o plano. */}
                  <dl className="mt-7">
                    <dt className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                      Valores e pacotes
                    </dt>
                    <dd className="font-serif text-[1.5rem] text-brand">
                      Fale com a recepção
                    </dd>
                  </dl>

                  {servico && servico.profissionais.length > 0 ? (
                    <p className="mt-5 text-[0.86rem] text-muted">
                      <span className="font-semibold text-ink">Com: </span>
                      {servico.profissionais.map((p) => p.nome).join(" · ")}
                    </p>
                  ) : null}

                  <div className="mt-8">
                    <BotaoLink href="/contato">Agendar avaliação</BotaoLink>
                  </div>
                </div>

                {e.foto ? (
                  <figure
                    className={`overflow-hidden rounded-[2rem] border border-line ${
                      par ? "lg:order-1" : ""
                    }`}
                  >
                    <Image
                      src={e.foto}
                      alt={`${e.titulo} na Vitapraxis`}
                      width={1200}
                      height={800}
                      className="h-[280px] w-full object-cover lg:h-[340px]"
                    />
                  </figure>
                ) : null}
              </div>

              {/* Destaques */}
              <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {e.destaques.map((d) => (
                  <article
                    key={d.nome}
                    className={`px-6 py-7 ${par ? "bg-bg" : "bg-surface"}`}
                  >
                    <h3 className="mb-1.5 font-sans text-[0.95rem] font-semibold text-accent">
                      {d.nome}
                    </h3>
                    <p className="text-[0.87rem] leading-relaxed text-muted">
                      {d.texto}
                    </p>
                  </article>
                ))}
              </div>

              {/* Fechamento */}
              <div className="mt-10 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
                <h3 className="text-[1.1rem] lg:w-40">
                  {e.fechamento.titulo}
                </h3>
                <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {e.fechamento.itens.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[0.9rem]"
                    >
                      <IconeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {e.rodape ? (
                <p className="mt-10 text-center font-serif text-[1.15rem] italic text-accent">
                  {e.rodape}
                </p>
              ) : null}
            </div>
          </section>
        );
      })}

      {/* ---------------- CHAMADA FINAL ---------------- */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <Eyebrow centro>Não sabe por onde começar?</Eyebrow>
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
            A avaliação define o caminho
          </h2>
          <p className="mx-auto mt-4 mb-9 text-muted">
            Conte o que está sentindo e a equipe indica a especialidade certa —
            ou a combinação delas.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <BotaoLink href="/contato">Agende sua avaliação</BotaoLink>
            <a
              href={CLINICA.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
