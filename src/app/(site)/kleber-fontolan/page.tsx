import Image from "next/image";
import Link from "next/link";
import { DIRETOR } from "@/lib/diretor";
import { CLINICA } from "@/lib/clinica";
import { BotaoLink, Eyebrow } from "@/components/ui";
import {
  IconeAssociacao,
  IconeCheck,
  IconeColuna,
  IconeEstrelaCheia,
  IconeFormacao,
  IconePacientes,
} from "@/components/icones";

export const metadata = {
  title: `${DIRETOR.nome} — Fundador e Diretor Clínico`,
  description: `${DIRETOR.nome}, ${DIRETOR.titulo} (${DIRETOR.registro}), fundador da Vitapraxis. ${DIRETOR.credencial}, mais de 25 mil pacientes atendidos, vice-presidente da Associação Brasileira de Quiropraxia Esportiva. ${CLINICA.endereco.bairro}, ${CLINICA.endereco.cidade}.`,
};

const ICONES = {
  coluna: IconeColuna,
  formacao: IconeFormacao,
  associacao: IconeAssociacao,
  pacientes: IconePacientes,
} as const;

export default function KleberPage() {
  return (
    <main>
      {/* ---------------- ABERTURA ---------------- */}
      <section className="relative overflow-hidden bg-vp-green py-16 text-[var(--on-brand)] lg:py-20 dark:bg-sunken dark:text-ink">
        <div
          className="pointer-events-none absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-vp-gold) 26%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--on-brand)_20%,transparent)] shadow-2xl dark:border-line">
            <Image
              src={DIRETOR.fotos.retrato}
              alt={`${DIRETOR.nome}, fundador e diretor clínico da Vitapraxis`}
              width={900}
              height={1100}
              priority
              className="w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-vp-gold">
              <span className="h-px w-6 bg-vp-gold" />
              Fundador e Diretor Clínico
            </div>

            <h1 className="text-[clamp(2.1rem,4vw,3rem)] leading-tight text-[var(--on-brand)] dark:text-ink">
              Dr. {DIRETOR.nome}
            </h1>

            <p className="mt-2 text-[0.9rem] font-semibold uppercase tracking-[0.1em] text-vp-gold">
              {DIRETOR.titulo} · {DIRETOR.registro}
            </p>

            <p className="mt-6 max-w-xl leading-relaxed text-[color-mix(in_srgb,var(--on-brand)_80%,transparent)] dark:text-muted">
              {DIRETOR.resumo}
            </p>

            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
              {DIRETOR.marcos.map((m) => (
                <div key={m.rotulo}>
                  <dt className="sr-only">{m.rotulo}</dt>
                  <dd>
                    <span className="block font-serif text-[1.9rem] leading-none text-vp-gold">
                      {m.valor}
                    </span>
                    <span className="mt-1.5 block text-[0.74rem] uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--on-brand)_70%,transparent)] dark:text-muted">
                      {m.rotulo}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3.5">
              <BotaoLink href="/contato" variante="claro">
                Agendar avaliação
              </BotaoLink>
              <a
                href={CLINICA.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-brand)_35%,transparent)] px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--on-brand)_12%,transparent)] dark:border-line"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CREDENCIAIS ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Formação e atuação</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              Duas décadas dedicadas à coluna vertebral
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {DIRETOR.credenciais.map((c) => {
              const Icone = ICONES[c.icone as keyof typeof ICONES];
              return (
                <article
                  key={c.texto}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40">
                    <Icone className="h-5 w-5 text-accent" />
                  </span>
                  <p className="pt-1.5 text-[0.95rem] leading-relaxed">
                    {c.texto}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- ATENDIDOS ---------------- */}
      <section className="border-y border-line bg-sunken py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-11 max-w-2xl">
            <div className="mb-4 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-accent">
              <IconeEstrelaCheia className="h-3.5 w-3.5" />
              Reconhecimento
            </div>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              {DIRETOR.atendidos.chamada}
            </h2>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {DIRETOR.atendidos.nomes.map((nome) => (
              <li
                key={nome}
                className="flex items-center gap-3 bg-surface px-7 py-6"
              >
                <IconeEstrelaCheia className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="font-serif text-[1.15rem]">{nome}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- ABORDAGEM ---------------- */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <Eyebrow>A abordagem</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              {DIRETOR.especialidade}
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              O trabalho começa por entender o que está por trás do sintoma. A
              avaliação funcional mapeia como sua coluna se move, onde há
              restrição e o que a rotina está cobrando do seu corpo — e só então
              o plano é montado.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              Nenhum ajuste é feito no automático. Cada sessão parte do que
              mudou desde a anterior, e o plano é revisto conforme você
              responde.
            </p>
            <p className="mt-8 font-serif text-[1.3rem] italic text-accent">
              {DIRETOR.lema}
            </p>
          </div>

          <figure className="overflow-hidden rounded-[2rem] border border-line">
            <Image
              src={DIRETOR.fotos.clinico}
              alt={`${DIRETOR.nome} apresentando um modelo anatômico da coluna vertebral durante atendimento`}
              width={1000}
              height={1250}
              className="w-full object-cover"
            />
          </figure>
        </div>
      </section>

      {/* ---------------- TRATAMENTOS ---------------- */}
      <section className="border-y border-line bg-sunken py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Tratamentos</Eyebrow>
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
              O que o Dr. {DIRETOR.primeiroNome} trata
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {DIRETOR.tratamentos.map((t) => (
              <article key={t.nome} className="bg-surface px-6 py-7">
                <IconeCheck className="mb-3 h-4 w-4 text-accent" />
                <h3 className="mb-1.5 font-sans text-[0.95rem] font-semibold">
                  {t.nome}
                </h3>
                <p className="text-[0.83rem] leading-relaxed text-muted">
                  {t.texto}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CHAMADA FINAL ---------------- */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <Eyebrow centro>Primeiro passo</Eyebrow>
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
            Agende sua avaliação e dê o primeiro passo para o seu bem-estar
          </h2>
          <p className="mx-auto mt-4 mb-9 text-muted">
            {CLINICA.endereco.completo}
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <BotaoLink href="/contato">Agendar avaliação</BotaoLink>
            <Link
              href="/#equipe"
              className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Conhecer a equipe
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
