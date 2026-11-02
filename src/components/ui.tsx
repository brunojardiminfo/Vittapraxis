import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------
   Primitivas visuais compartilhadas pelas três frentes (site, app, painel).
   ------------------------------------------------------------------------- */

export function Logo({
  altura = 34,
  emFundoEscuro = false,
}: {
  altura?: number;
  emFundoEscuro?: boolean;
}) {
  // Duas artes oficiais, ambas em PNG com fundo transparente: o símbolo é
  // dourado nas duas, e o que muda é a cor do nome — verde para fundo claro,
  // branco para fundo escuro. Antes havia só um JPEG de fundo branco, que
  // precisava de plaqueta para não virar um retângulo recortado no verde.
  const src = emFundoEscuro
    ? "/marca/vitapraxis-horizontal-clara.png"
    : "/marca/vitapraxis-horizontal.png";

  return (
    <Image
      src={src}
      alt="Vitapraxis"
      width={1340}
      height={417}
      priority
      style={{ height: altura, width: "auto" }}
    />
  );
}

export function Eyebrow({
  children,
  centro = false,
}: {
  children: ReactNode;
  centro?: boolean;
}) {
  return (
    <div
      className={`mb-4 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-accent ${
        centro ? "justify-center" : ""
      }`}
    >
      <span className="h-px w-6 bg-accent" />
      {children}
    </div>
  );
}

const TONS = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  muted: "bg-sunken text-muted",
} as const;

export function Pill({
  children,
  tom = "muted",
}: {
  children: ReactNode;
  tom?: keyof typeof TONS;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-bold ${TONS[tom]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHead({
  titulo,
  acao,
}: {
  titulo: string;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-sans text-[0.92rem] font-semibold">{titulo}</h3>
      {acao}
    </div>
  );
}

export function SectionTitle({
  children,
  acao,
}: {
  children: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3.5">
      <h2 className="text-[1.2rem]">{children}</h2>
      <span className="h-px flex-1 bg-line" />
      {acao}
    </div>
  );
}

export function Stat({ valor, rotulo }: { valor: ReactNode; rotulo: string }) {
  return (
    <div className="flex-1 rounded-xl bg-sunken px-2 py-3.5 text-center">
      <div className="font-serif text-[1.7rem] leading-none text-brand">
        {valor}
      </div>
      <div className="mt-1 text-[0.72rem] text-muted">{rotulo}</div>
    </div>
  );
}

export function Progress({ valor }: { valor: number }) {
  const pct = Math.max(0, Math.min(100, valor));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-vp-gold-deep to-vp-gold"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* --- Botões ------------------------------------------------------------- */

const BASE_BTN =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES = {
  primario:
    "bg-vp-green text-[var(--on-brand)] hover:bg-vp-gold-deep hover:-translate-y-0.5 dark:bg-vp-gold dark:text-vp-green-deep dark:hover:bg-vp-gold-pale",
  contorno:
    "border border-line bg-transparent text-ink hover:border-accent hover:text-accent",
  claro: "bg-vp-gold text-vp-green-deep hover:bg-vp-gold-pale",
} as const;

const TAMANHOS = {
  sm: "px-4 py-2 text-[0.82rem]",
  md: "px-7 py-3.5",
} as const;

type BtnProps = {
  children: ReactNode;
  variante?: keyof typeof VARIANTES;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
};

export function BotaoLink({
  href,
  children,
  variante = "primario",
  tamanho = "md",
  className = "",
}: BtnProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`${BASE_BTN} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Botao({
  children,
  variante = "primario",
  tamanho = "md",
  className = "",
  ...rest
}: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`${BASE_BTN} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
    >
      {children}
    </button>
  );
}

/* --- Avatar ------------------------------------------------------------- */

export function Avatar({
  iniciais,
  tamanho = 52,
  dourado = false,
  foto,
  nome,
}: {
  iniciais: string;
  tamanho?: number;
  dourado?: boolean;
  foto?: string | null;
  nome?: string;
}) {
  // Nem todo profissional tem retrato no material da clínica; quem não tem
  // cai no monograma, que continua legível e consistente com a marca.
  if (foto) {
    return (
      <span
        className="inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-vp-green/25"
        style={{ width: tamanho, height: tamanho }}
      >
        <Image
          src={foto}
          alt={nome ? `Retrato de ${nome}` : ""}
          width={400}
          height={400}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-serif ${
        dourado
          ? "bg-gradient-to-br from-vp-gold to-vp-gold-deep text-vp-green-deep font-bold"
          : "bg-gradient-to-br from-vp-green to-vp-green-deep text-vp-gold-pale"
      }`}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.34 }}
      aria-hidden
    >
      {iniciais}
    </span>
  );
}

/* --- Estado vazio ------------------------------------------------------- */

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}
