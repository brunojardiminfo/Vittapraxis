import Image from "next/image";
import Link from "next/link";
import { CLINICA } from "@/lib/clinica";
import { comoFunciona, regrasDoClube, textoIndicacao } from "@/lib/clube";
import { BotaoLink, Eyebrow } from "@/components/ui";
import { IconeCheck, IconeEstrela } from "@/components/icones";

// Lê regras e serviços do banco: renderizar a cada visita faz a mudança
// do admin aparecer na hora, e tira o build da dependência do banco.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clube Vitapraxis",
  description:
    "Cashback a cada indicação, pontos por sessão e vantagens que crescem com você. Conheça o Clube Vitapraxis, em Auxiliadora, Porto Alegre.",
};

export default async function ClubePage({
  searchParams,
}: {
  searchParams: Promise<{ indicacao?: string }>;
}) {
  const { indicacao } = await searchParams;
  const regras = await regrasDoClube();
  const passos = comoFunciona(regras);
  const [, ouro] = regras.niveis;

  return (
    <main>
      {/* ---------------- ABERTURA ----------------
          A foto ocupa a seção inteira e o texto vem por cima, sobre um véu
          escuro. O cartão ao lado, translúcido, deixa o ambiente aparecer
          através dele — é a clínica que sustenta a promessa do Clube. */}
      <section className="relative isolate overflow-hidden py-20 lg:py-28">
        <Image
          src="/clinica/recepcao.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* Véu: sem ele o texto claro não sobrevive às áreas claras da foto */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(105deg, color-mix(in srgb, var(--color-vp-green) 94%, transparent) 0%, color-mix(in srgb, var(--color-vp-green) 78%, transparent) 45%, color-mix(in srgb, var(--color-vp-green-deep) 55%, transparent) 100%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div className="text-[var(--color-vp-cream)]">
            <div className="mb-5 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-vp-gold">
              <span className="h-px w-6 bg-vp-gold" />
              Clube Vitapraxis
            </div>

            <h1 className="text-[clamp(2.3rem,4.6vw,3.4rem)] leading-[1.05] text-[var(--color-vp-cream)]">
              Quem cuida da saúde
              <br />
              merece ser{" "}
              <em className="not-italic text-vp-gold">reconhecido</em>.
            </h1>

            <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-[color-mix(in_srgb,var(--color-vp-cream)_82%,transparent)]">
              Cada sessão vira ponto. Cada indicação vira dinheiro de volta. E
              quanto mais longe você vai no tratamento, mais o Clube devolve.
            </p>

            {/* Quem chegou por um convite vê que o código foi reconhecido */}
            {indicacao ? (
              <p className="mt-7 inline-flex items-start gap-2.5 rounded-2xl border border-[color-mix(in_srgb,var(--color-vp-cream)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-vp-cream)_10%,transparent)] px-5 py-4 text-[0.9rem] backdrop-blur-sm">
                <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-vp-gold" />
                <span>
                  Você chegou pelo convite de{" "}
                  <strong className="font-semibold">{indicacao}</strong>.
                  Informe esse código no contato para vocês dois ganharem.
                </span>
              </p>
            ) : null}

            <div className="mt-9 flex flex-wrap gap-3.5">
              <BotaoLink
                href={
                  indicacao
                    ? `/contato?indicacao=${encodeURIComponent(indicacao)}`
                    : "/contato"
                }
                variante="claro"
              >
                Quero fazer parte
              </BotaoLink>
              <Link
                href="/entrar"
                className="inline-flex items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-vp-cream)_38%,transparent)] px-7 py-3.5 text-sm font-semibold text-[var(--color-vp-cream)] backdrop-blur-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-vp-cream)_14%,transparent)]"
              >
                Já sou paciente
              </Link>
            </div>
          </div>

          {/* Cartão translúcido: os números do Clube sobre o ambiente real */}
          <aside className="rounded-[1.75rem] border border-[color-mix(in_srgb,var(--color-vp-cream)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-vp-green-deep)_45%,transparent)] p-8 backdrop-blur-md">
            <p className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-vp-gold">
              Como o benefício cresce
            </p>

            <dl className="flex flex-col gap-5">
              {[
                [
                  `${regras.pontosPorSessao} pontos`,
                  "a cada sessão realizada",
                ],
                [
                  `${regras.indicacaoPercentual.toLocaleString("pt-BR")}%`,
                  "da primeira sessão de quem você indicar, em cashback",
                ],
                [
                  `${Math.ceil(ouro.minimo / regras.pontosPorSessao)} sessões`,
                  `é o que separa você do nível ${ouro.nome}`,
                ],
              ].map(([valor, texto]) => (
                <div
                  key={texto}
                  className="border-b border-[color-mix(in_srgb,var(--color-vp-cream)_18%,transparent)] pb-5 last:border-none last:pb-0"
                >
                  <dt className="font-serif text-[2rem] leading-none text-[var(--color-vp-cream)]">
                    {valor}
                  </dt>
                  <dd className="mt-1.5 text-[0.86rem] text-[color-mix(in_srgb,var(--color-vp-cream)_72%,transparent)]">
                    {texto}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-[0.78rem] leading-relaxed text-[color-mix(in_srgb,var(--color-vp-cream)_60%,transparent)]">
              Sem mensalidade e sem cadastro à parte: quem é paciente já faz
              parte.
            </p>
          </aside>
        </div>
      </section>

      {/* ---------------- COMO FUNCIONA ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Como funciona</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              Simples: você se trata, o benefício acumula
            </h2>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {passos.map((item, i) => (
              <li key={item.titulo} className="bg-surface px-7 py-8">
                <span className="mb-4 block font-serif text-[1.5rem] text-accent">
                  0{i + 1}
                </span>
                <h3 className="mb-2 font-sans text-[0.98rem] font-semibold">
                  {item.titulo}
                </h3>
                <p className="text-[0.87rem] leading-relaxed text-muted">
                  {item.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- NÍVEIS ---------------- */}
      <section className="border-y border-line bg-sunken py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Níveis</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              Quanto mais você se cuida, mais o Clube devolve
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {regras.niveis.map((n, i) => (
              <article
                key={n.nome}
                className={`rounded-2xl border bg-surface p-7 ${
                  i === regras.niveis.length - 1 ? "border-accent" : "border-line"
                }`}
              >
                <div className="mb-4 flex items-center gap-2.5">
                  {Array.from({ length: i + 1 }).map((_, s) => (
                    <IconeEstrela key={s} className="h-4 w-4 text-accent" />
                  ))}
                </div>
                <h3 className="text-[1.25rem]">{n.nome}</h3>
                <p className="mt-1 text-[0.8rem] uppercase tracking-[0.1em] text-muted">
                  {n.minimo === 0
                    ? "desde a primeira sessão"
                    : `a partir de ${n.minimo.toLocaleString("pt-BR")} pontos`}
                </p>
                <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">
                  {n.beneficio}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-[0.86rem] text-muted">
            Os pontos entram sozinhos quando a clínica confirma a sessão. Você
            não precisa pedir nada.
          </p>
        </div>
      </section>

      {/* ---------------- INDICAÇÃO ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <Eyebrow centro>Indique quem você gosta</Eyebrow>
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
            {regras.indicacaoPercentual.toLocaleString("pt-BR")}% de cashback por indicação
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Cada paciente tem um código próprio. O cashback cai na sua conta
            quando a pessoa indicada faz a primeira sessão — não quando ela
            promete, quando ela vem. E ela também entra com benefício.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
            {[
              ["Compartilhe", "Seu código vai pronto pelo WhatsApp"],
              ["A pessoa se trata", "Informa o código e faz a primeira sessão"],
              [
                "O dinheiro entra",
                `${textoIndicacao(regras)} dela vira desconto nas suas`,
              ],
            ].map(([titulo, texto]) => (
              <div key={titulo} className="bg-surface px-6 py-7">
                <h3 className="mb-1.5 font-sans text-[0.92rem] font-semibold">
                  {titulo}
                </h3>
                <p className="text-[0.84rem] text-muted">{texto}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-[0.86rem] text-muted">
            Seu código fica na área do paciente, em Clube de Benefícios, junto
            com o botão de compartilhar.
          </p>
        </div>
      </section>

      {/* ---------------- CHAMADA FINAL ---------------- */}
      <section className="border-t border-line py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
            Entrar no Clube é começar a se tratar
          </h2>
          <p className="mx-auto mt-4 mb-9 text-muted">
            Não tem mensalidade nem cadastro à parte: quem é paciente da
            Vitapraxis já faz parte. {CLINICA.endereco.completo}
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <BotaoLink
              href={
                indicacao
                  ? `/contato?indicacao=${encodeURIComponent(indicacao)}`
                  : "/contato"
              }
            >
              Agendar minha avaliação
            </BotaoLink>
            <a
              href={CLINICA.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Tirar dúvidas no WhatsApp
            </a>
          </div>
          <p className="mt-8 text-[0.86rem] text-muted">
            Não é paciente ainda?{" "}
            <Link
              href="/vale-presente"
              className="font-semibold text-accent hover:underline"
            >
              Dê a Vitapraxis de presente
            </Link>{" "}
            para alguém especial.
          </p>
        </div>
      </section>
    </main>
  );
}
