import Image from "next/image";
import { db } from "@/lib/db";
import { CLINICA } from "@/lib/clinica";
import { Eyebrow } from "@/components/ui";
import {
  IconeChat,
  IconeInstagram,
  IconeLocal,
  IconeRelogio,
  IconeTelefone,
} from "@/components/icones";
import { FormularioContato } from "./formulario";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contato",
  description: `Agende sua avaliação na Vitapraxis. ${CLINICA.endereco.completo}. WhatsApp ${CLINICA.whatsapp.exibicao}.`,
};

const CANAIS = [
  {
    Icone: IconeChat,
    titulo: "WhatsApp",
    valor: CLINICA.whatsapp.exibicao,
    href: CLINICA.whatsapp.link,
    externo: true,
  },
  {
    Icone: IconeTelefone,
    titulo: "Telefone",
    valor: CLINICA.telefone.exibicao,
    href: CLINICA.telefone.link,
    externo: false,
  },
  {
    Icone: IconeInstagram,
    titulo: "Instagram",
    valor: `@${CLINICA.instagram.usuario}`,
    href: CLINICA.instagram.link,
    externo: true,
  },
  {
    Icone: IconeRelogio,
    titulo: "Atendimento",
    valor: CLINICA.horario.resumo,
    href: null,
    externo: false,
  },
];

export default async function ContatoPage({
  searchParams,
}: {
  searchParams: Promise<{ indicacao?: string }>;
}) {
  const { indicacao } = await searchParams;
  const servicos = await db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    select: { nome: true },
  });

  return (
    <main>
      <section className="border-b border-line bg-sunken py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Eyebrow>Fale com a Vitapraxis</Eyebrow>
          <h1 className="max-w-2xl text-[clamp(2rem,3.6vw,2.8rem)]">
            Será um prazer receber você
          </h1>
          <p className="mt-4 max-w-xl text-[1.02rem] text-muted">
            Estamos no bairro Auxiliadora, em Porto Alegre. Agende sua
            avaliação pelo formulário ou fale direto com a recepção.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          {/* Canais e endereço */}
          <div>
            <a
              href={CLINICA.endereco.mapa}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-3xl border border-line"
            >
              <Image
                src="/clinica/recepcao.webp"
                alt="Recepção da clínica Vitapraxis, com parede verde natural e balcão de mármore"
                width={1500}
                height={820}
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="flex items-start gap-3 bg-surface p-5">
                <IconeLocal className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-[0.94rem] font-semibold">
                    {CLINICA.endereco.logradouro}
                  </p>
                  <p className="text-[0.86rem] text-muted">
                    {CLINICA.endereco.bairro} — {CLINICA.endereco.cidade}/
                    {CLINICA.endereco.uf}
                  </p>
                  <p className="mt-1.5 text-[0.8rem] font-semibold text-accent">
                    Abrir no Google Maps →
                  </p>
                </div>
              </div>
            </a>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {CANAIS.map(({ Icone, titulo, valor, href, externo }) => {
                const conteudo = (
                  <>
                    <Icone className="mb-2.5 h-5 w-5 text-accent" />
                    <p className="text-[0.72rem] uppercase tracking-wider text-muted">
                      {titulo}
                    </p>
                    <p className="text-[0.9rem] font-semibold">{valor}</p>
                  </>
                );
                const classe =
                  "block rounded-2xl border border-line bg-surface p-5 transition-all";

                return (
                  <li key={titulo}>
                    {href ? (
                      <a
                        href={href}
                        {...(externo
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className={`${classe} hover:-translate-y-0.5 hover:border-accent`}
                      >
                        {conteudo}
                      </a>
                    ) : (
                      <div className={classe}>{conteudo}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <a
              href={`mailto:${CLINICA.email}`}
              className="mt-3 block rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent"
            >
              <p className="text-[0.72rem] uppercase tracking-wider text-muted">
                E-mail
              </p>
              <p className="text-[0.9rem] font-semibold">{CLINICA.email}</p>
            </a>
          </div>

          {/* Cadastro */}
          <FormularioContato
            servicos={servicos.map((s) => s.nome)}
            indicadoPor={indicacao}
          />
        </div>
      </section>
    </main>
  );
}
