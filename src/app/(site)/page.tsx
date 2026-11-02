import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { CLINICA } from "@/lib/clinica";
import { SLIDES_HOME } from "@/lib/destaques-home";
import { HeroCarrossel } from "@/components/hero-carrossel";
import { DIRETOR } from "@/lib/diretor";
import { Avatar, BotaoLink, Eyebrow } from "@/components/ui";
import { IconeCheck } from "@/components/icones";

export const dynamic = "force-dynamic";

const PILARES = [
  ["Saúde", "Tratamentos que equilibram o corpo e restauram sua vitalidade."],
  ["Longevidade", "Cuidado preventivo e contínuo, para os anos que vêm."],
  ["Espiritualidade", "Conexão com propósito e bem-estar emocional."],
  ["Equilíbrio", "Harmonia entre corpo, rotina e vida pessoal."],
];

const DIFERENCIAIS = [
  ["Tratamento Personalizado", "Tratamentos feitos para você, a partir da sua história."],
  ["Equipe Multidisciplinar", "Profissionais de diferentes áreas trabalhando juntos."],
  ["Plano Individualizado", "Um plano terapêutico exclusivo para seus objetivos."],
  ["Ambiente Acolhedor", "Conforto e cuidado em cada detalhe do atendimento."],
  [
    "Localização Privilegiada",
    "No bairro Auxiliadora, com fácil acesso e comodidade.",
  ],
  ["Acompanhamento Contínuo", "Presença próxima até o resultado que você busca."],
];

const JORNADA = [
  ["Agendamento", "Buscamos o melhor horário para você."],
  ["Avaliação Completa", "Analisamos suas necessidades a fundo."],
  ["Plano Personalizado", "Criamos um plano exclusivo para o seu caso."],
  ["Acompanhamento", "Seguimos sua evolução de perto, sessão a sessão."],
  ["Qualidade de Vida", "Mais saúde, movimento e equilíbrio."],
];

const BENEFICIOS_MIOFASCIAL = [
  ["Melhora do Desempenho", "Aumenta a eficiência muscular e potencializa a performance."],
  ["Prevenção de Lesões", "Reduz tensões e desequilíbrios, diminuindo o risco de contusões."],
  ["Alívio de Dores", "Libera aderências miofasciais que causam dor e rigidez."],
  ["Recuperação Acelerada", "Reduz o tempo de recuperação pós-treino e pós-competição."],
  ["Mobilidade e Flexibilidade", "Melhora a amplitude e a qualidade do movimento."],
  ["Redução de Inflamações", "Estimula a circulação e auxilia na eliminação de toxinas."],
  ["Equilíbrio Corpo e Mente", "Promove relaxamento profundo e melhora o foco."],
  ["Atendimento Individual", "Abordagem segura e eficaz, feita sob medida."],
];

export default async function LandingPage() {
  const [profissionais, servicos] = await Promise.all([
    db.profissional.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
    db.servico.findMany({
      orderBy: { ordem: "asc" },
      include: { profissionais: { select: { nome: true } } },
    }),
  ]);

  const diretor = profissionais.find((p) => p.ehDiretor);
  const equipe = profissionais.filter((p) => !p.ehDiretor);

  const grupos = equipe.reduce<Record<string, typeof equipe>>((acc, p) => {
    (acc[p.especialidade] ??= []).push(p);
    return acc;
  }, {});

  return (
    <main>
      <HeroCarrossel slides={SLIDES_HOME} />

      {/* ---------------- MANIFESTO ---------------- */}
      <section className="px-6 py-20 text-center lg:px-8">
        <blockquote className="mx-auto max-w-3xl font-serif text-[clamp(1.3rem,2.4vw,1.8rem)] italic leading-snug">
          &ldquo;Somos mais que uma clínica de quiropraxia. Somos um centro de
          bem-estar.&rdquo;
        </blockquote>
        <p className="mt-5 text-[0.78rem] uppercase tracking-[0.16em] text-accent">
          Vitapraxis
        </p>
      </section>

      {/* ---------------- PILARES ---------------- */}
      <section id="pilares" className="border-y border-line bg-sunken py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow centro>Nossa marca representa</Eyebrow>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
              Os Quatro Pilares do Bem-Estar
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {PILARES.map(([nome, texto], i) => (
              <div key={nome} className="bg-surface px-7 py-10 text-center">
                <span className="mx-auto mb-4 block font-serif text-[1.5rem] text-accent">
                  0{i + 1}
                </span>
                <h3 className="mb-2.5 text-[1.1rem]">{nome}</h3>
                <p className="text-[0.9rem] text-muted">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- AMBIENTE ---------------- */}
      <section id="ambiente" className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-11 max-w-2xl">
            <Eyebrow>A clínica</Eyebrow>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
              Um ambiente pensado para o seu bem-estar
            </h2>
            <p className="mt-4 text-muted">
              Um espaço no coração do bairro {CLINICA.endereco.bairro},
              projetado para você respirar fundo antes mesmo da sessão
              começar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <figure className="overflow-hidden rounded-2xl border border-line sm:col-span-3">
              <Image
                src="/clinica/recepcao.webp"
                alt="Sala de espera com parede verde natural, poltronas e balcão de mármore"
                width={1500}
                height={820}
                className="h-[240px] w-full object-cover lg:h-[380px]"
              />
            </figure>
            {[
              ["sala-vista", "Sala de atendimento com vista para a cidade"],
              ["sala-maca", "Sala de massoterapia com maca preparada"],
              ["consultorio", "Consultório para avaliação e acompanhamento"],
            ].map(([arquivo, alt]) => (
              <figure
                key={arquivo}
                className="overflow-hidden rounded-2xl border border-line"
              >
                <Image
                  src={`/clinica/${arquivo}.webp`}
                  alt={alt}
                  width={960}
                  height={1560}
                  className="h-[240px] w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- DIREÇÃO CLÍNICA ---------------- */}
      {diretor ? (
        <section className="border-y border-line bg-sunken py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <Link
              href="/kleber-fontolan"
              className="group relative mx-auto block w-full max-w-xs"
            >
              <div className="overflow-hidden rounded-[2rem] border border-line">
                <Image
                  src={DIRETOR.fotos.retrato}
                  alt={`Retrato de ${diretor.nome}, fundador e diretor clínico da Vitapraxis`}
                  width={900}
                  height={1100}
                  className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {diretor.credencial ? (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-vp-green px-6 py-2.5 text-[0.8rem] font-semibold text-vp-gold shadow-lg">
                  {diretor.credencial}
                </div>
              ) : null}
            </Link>

            <div>
              <Eyebrow>Fundador e Diretor Clínico</Eyebrow>
              <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
                {diretor.nome}
              </h2>
              <p className="mt-1.5 text-[0.86rem] font-semibold uppercase tracking-[0.12em] text-accent">
                {DIRETOR.titulo} · {DIRETOR.registro} · Coluna vertebral e
                sistema musculoesquelético
              </p>
              <p className="mt-5 max-w-xl leading-relaxed text-muted">
                {DIRETOR.resumo}
              </p>

              {/* Os números carregam mais peso que a lista de tratamentos —
                  o detalhe fica para a página dedicada */}
              <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
                {DIRETOR.marcos.map((m) => (
                  <div key={m.rotulo}>
                    <dt className="sr-only">{m.rotulo}</dt>
                    <dd>
                      <span className="block font-serif text-[1.7rem] leading-none text-brand">
                        {m.valor}
                      </span>
                      <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.1em] text-muted">
                        {m.rotulo}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-7 rounded-xl bg-surface px-5 py-4 text-[0.88rem] leading-relaxed">
                <span className="font-semibold">
                  Vice-presidente da Associação Brasileira de Quiropraxia
                  Esportiva.
                </span>{" "}
                Atendeu Luiz Suárez e muitos outros atletas, e também alguns
                artistas globais.
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <BotaoLink href="/kleber-fontolan">
                  Conheça a trajetória
                </BotaoLink>
                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  Agendar com {DIRETOR.primeiroNome}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- POR QUE ESCOLHER ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Por que escolher a Vitapraxis</Eyebrow>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
              Cuidado integrado para sua saúde e bem-estar
            </h2>
          </div>
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
            {DIFERENCIAIS.map(([titulo, texto], i) => (
              <div key={titulo} className="flex gap-4">
                <span className="w-9 shrink-0 font-serif text-[1.6rem] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="mb-1.5 text-[1.05rem]">{titulo}</h3>
                  <p className="text-[0.92rem] text-muted">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- EQUIPE ---------------- */}
      <section id="equipe" className="border-t border-line py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Nossa equipe</Eyebrow>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
              Especialistas comprometidos com o seu bem-estar
            </h2>
          </div>

          {Object.entries(grupos).map(([especialidade, pessoas]) => (
            <div key={especialidade} className="mb-11 last:mb-0">
              <p className="mb-6 border-b border-line pb-3.5 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-brand">
                {especialidade}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pessoas.map((p) => (
                  <article
                    key={p.id}
                    className="flex gap-4 rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent"
                  >
                    <Avatar
                      iniciais={p.iniciais}
                      tamanho={64}
                      foto={p.foto}
                      nome={p.nome}
                    />
                    <div className="min-w-0">
                      <h3 className="font-sans text-[0.98rem] font-semibold">
                        {p.nome}
                      </h3>
                      <p className="mb-2 text-[0.78rem] font-semibold text-accent">
                        {p.especialidade}
                      </p>
                      <p className="text-[0.84rem] leading-relaxed text-muted">
                        {p.bio}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- LIBERAÇÃO MIOFASCIAL ---------------- */}
      <section
        id="miofascial"
        className="relative overflow-hidden bg-vp-green py-20 text-[var(--on-brand)] dark:border-y dark:border-line dark:bg-sunken dark:text-ink"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-40 h-[520px] w-[520px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-vp-gold) 28%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <div className="mb-4 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-vp-gold">
              <span className="h-px w-6 bg-vp-gold" />
              Especialidade em destaque
            </div>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)] text-[var(--on-brand)] dark:text-ink">
              Liberação Miofascial para atletas e praticantes de atividade
              física
            </h2>
            <p className="mt-5 max-w-xl text-[color-mix(in_srgb,var(--on-brand)_78%,transparent)] dark:text-muted">
              Técnicas avançadas que preparam o corpo para o desempenho e
              aceleram a recuperação, com Evandro Sajdak.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--on-brand)_15%,transparent)] sm:grid-cols-2 lg:grid-cols-4 dark:bg-line">
            {BENEFICIOS_MIOFASCIAL.map(([titulo, texto]) => (
              <div
                key={titulo}
                className="bg-[color-mix(in_srgb,var(--color-vp-green-deep)_55%,transparent)] px-6 py-7 dark:bg-surface"
              >
                <h3 className="mb-2 font-sans text-[0.95rem] font-semibold text-vp-gold dark:text-accent">
                  {titulo}
                </h3>
                <p className="text-[0.85rem] text-[color-mix(in_srgb,var(--on-brand)_72%,transparent)] dark:text-muted">
                  {texto}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-11 text-center font-serif text-[1.2rem] italic text-vp-gold">
            &ldquo;Corpo livre, mente forte, performance elevada.&rdquo;
          </p>
        </div>
      </section>

      {/* ---------------- JORNADA ---------------- */}
      <section id="jornada" className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <Eyebrow>Como funciona</Eyebrow>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
              Um processo completo para cuidar de você
            </h2>
          </div>
          <ol className="border-t border-line">
            {JORNADA.map(([titulo, texto], i) => (
              <li
                key={titulo}
                className="grid grid-cols-[64px_1fr] gap-7 border-b border-line py-7"
              >
                <span className="font-serif text-[1.6rem] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h3 className="min-w-[15rem] text-[1.15rem]">{titulo}</h3>
                  <p className="text-muted">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- CATÁLOGO DE SERVIÇOS ---------------- */}
      <section id="catalogo" className="border-y border-line bg-sunken py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>Catálogo de Serviços</Eyebrow>
              <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
                Cuidar do seu corpo é investir no seu melhor desempenho
              </h2>
            </div>
            <Link
              href="/especialidades"
              className="text-[0.88rem] font-semibold text-accent hover:underline"
            >
              Ver o que cada especialidade trata →
            </Link>
          </div>

          {/* Mesmo cartão do catálogo do portal — benefícios e equipe — só
              que sem valor, que aqui a recepção fecha na avaliação. */}
          <div className="grid gap-5 lg:grid-cols-2">
            {servicos.map((s) => (
              <article
                key={s.id}
                className="flex flex-col rounded-2xl border border-line bg-surface p-6"
              >
                <h3 className="mb-3 text-[1.15rem]">{s.nome}</h3>

                <p className="mb-4 text-[0.9rem] leading-relaxed text-muted">
                  {s.descricao}
                </p>

                <ul className="mb-5 flex flex-col gap-1.5">
                  {s.beneficios.split("|").map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-[0.86rem]"
                    >
                      <IconeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
                      {b}
                    </li>
                  ))}
                </ul>

                {s.profissionais.length > 0 ? (
                  <p className="mt-auto border-t border-line pt-4 text-[0.78rem] text-muted">
                    <span className="font-semibold text-ink">Com: </span>
                    {s.profissionais.map((p) => p.nome).join(" · ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <p className="mt-8 text-[0.88rem] leading-relaxed text-muted">
            Valores e pacotes variam conforme o plano de tratamento montado na
            avaliação.{" "}
            <a
              href={CLINICA.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Fale com a recepção no WhatsApp
            </a>{" "}
            para saber condições e formas de pagamento.
          </p>
        </div>
      </section>

      {/* ---------------- CTA FINAL ---------------- */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <Eyebrow centro>Vitapraxis</Eyebrow>
          <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)]">
            Será um prazer receber você
          </h2>
          <p className="mx-auto mt-4 mb-9 text-muted">
            {CLINICA.endereco.completo}
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <BotaoLink href="/contato">Agende sua Avaliação</BotaoLink>
            <a
              href={CLINICA.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              {CLINICA.whatsapp.exibicao}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
