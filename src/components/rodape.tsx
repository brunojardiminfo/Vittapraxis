import Link from "next/link";
import { CLINICA } from "@/lib/clinica";
import { DESENVOLVEDOR } from "@/lib/desenvolvedor";
import { Logo } from "@/components/ui";
import {
  IconeChat,
  IconeInstagram,
  IconeLocal,
  IconeRelogio,
  IconeTelefone,
} from "@/components/icones";

const SERVICOS = [
  "Quiropraxia",
  "Massoterapia",
  "Liberação Miofascial",
  "Acupuntura",
  "Nutrição",
  "Fisioterapia ATM",
  "Iridologia",
];

export function Rodape() {
  return (
    <footer className="border-t border-line bg-vp-green text-[var(--on-brand)] dark:bg-surface dark:text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.3fr_1fr_1.2fr] lg:px-8">
        {/* Marca e endereço */}
        <div>
          <Logo altura={30} emFundoEscuro />
          <p className="mt-5 max-w-xs text-[0.88rem] leading-relaxed text-[color-mix(in_srgb,var(--on-brand)_75%,transparent)] dark:text-muted">
            {CLINICA.lema}
          </p>

          <a
            href={CLINICA.endereco.mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-start gap-3 text-[0.88rem] transition-colors hover:text-vp-gold"
          >
            <IconeLocal className="mt-0.5 h-4 w-4 shrink-0 text-vp-gold" />
            <span>
              {CLINICA.endereco.logradouro}
              <br />
              {CLINICA.endereco.bairro} — {CLINICA.endereco.cidade}/
              {CLINICA.endereco.uf}
              <span className="mt-1 block text-[0.78rem] text-vp-gold">
                Ver no mapa →
              </span>
            </span>
          </a>
        </div>

        {/* Serviços */}
        <nav aria-label="Serviços">
          <h2 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-vp-gold">
            Especialidades
          </h2>
          <ul className="flex flex-col gap-2 text-[0.88rem]">
            {SERVICOS.map((s) => (
              <li key={s}>
                <Link
                  href="/#catalogo"
                  className="text-[color-mix(in_srgb,var(--on-brand)_80%,transparent)] transition-colors hover:text-vp-gold dark:text-muted"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contato */}
        <div>
          <h2 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-vp-gold">
            Fale com a gente
          </h2>
          <ul className="flex flex-col gap-3.5 text-[0.88rem]">
            <li>
              <a
                href={CLINICA.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-vp-gold"
              >
                <IconeChat className="h-4 w-4 shrink-0 text-vp-gold" />
                WhatsApp {CLINICA.whatsapp.exibicao}
              </a>
            </li>
            <li>
              <a
                href={CLINICA.telefone.link}
                className="flex items-center gap-3 transition-colors hover:text-vp-gold"
              >
                <IconeTelefone className="h-4 w-4 shrink-0 text-vp-gold" />
                {CLINICA.telefone.exibicao}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CLINICA.email}`}
                className="flex items-center gap-3 transition-colors hover:text-vp-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="h-4 w-4 shrink-0 text-vp-gold"
                  aria-hidden
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                {CLINICA.email}
              </a>
            </li>
            <li>
              <a
                href={CLINICA.instagram.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-vp-gold"
              >
                <IconeInstagram className="h-4 w-4 shrink-0 text-vp-gold" />
                @{CLINICA.instagram.usuario}
              </a>
            </li>
            <li className="flex items-center gap-3 text-[color-mix(in_srgb,var(--on-brand)_75%,transparent)] dark:text-muted">
              <IconeRelogio className="h-4 w-4 shrink-0 text-vp-gold" />
              {CLINICA.horario.resumo}
            </li>
          </ul>

          <Link
            href="/contato"
            className="mt-6 inline-flex rounded-full bg-vp-gold px-6 py-2.5 text-[0.84rem] font-semibold text-vp-green-deep transition-colors hover:bg-vp-gold-pale"
          >
            Quero ser paciente
          </Link>
        </div>
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--on-brand)_15%,transparent)] dark:border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-[0.78rem] text-[color-mix(in_srgb,var(--on-brand)_65%,transparent)] lg:px-8 dark:text-muted">
          <p>
            © {new Date().getFullYear()} {CLINICA.nome}. Todos os direitos
            reservados.{" "}
            <span className="whitespace-nowrap">
              Desenvolvido por{" "}
              <a
                href={DESENVOLVEDOR.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-colors hover:text-vp-gold"
              >
                {DESENVOLVEDOR.nome}
              </a>
            </span>
          </p>
          <div className="flex gap-5">
            <Link href="/contato" className="transition-colors hover:text-vp-gold">
              Contato
            </Link>
            <Link
              href="/vale-presente"
              className="transition-colors hover:text-vp-gold"
            >
              Vale-presente
            </Link>
            <Link href="/entrar" className="transition-colors hover:text-vp-gold">
              Área do paciente
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
