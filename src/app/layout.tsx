import type { Metadata } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import "./globals.css";

/**
 * Duas famílias, e só duas: Montserrat, a fonte da marca, no texto e na
 * navegação; Bodoni nos títulos.
 *
 * A especificação da marca pede Bodoni FLF, que não é distribuída como
 * webfont. Bodoni Moda é o mesmo desenho didone — mesmo contraste entre haste
 * grossa e fina, mesma serifa reta — publicado com licença aberta e servido
 * junto com o site. Se a clínica tiver o arquivo da FLF licenciado, é trocar
 * este import por next/font/local apontando para ele.
 *
 * Antes as fontes eram só *pedidas* no CSS, sem nunca serem carregadas — quem
 * não tivesse Inter instalada via Segoe UI, e quem não tivesse Georgia via
 * Times. Era por isso que a mesma tela mudava de cara de um computador para
 * outro.
 */
const serif = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-serif",
});

const sans = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Vitapraxis — Centro de Bem-Estar",
    template: "%s · Vitapraxis",
  },
  description:
    "Clínica multidisciplinar em Auxiliadora, Porto Alegre: Quiropraxia, Massoterapia, Acupuntura, Fisioterapia ATM, Nutrição e Iridologia. Tratamentos individualizados com excelência em cuidado.",
  keywords: [
    "quiropraxia Porto Alegre",
    "massoterapia Porto Alegre",
    "acupuntura",
    "fisioterapia ATM",
    "nutrição",
    "liberação miofascial",
    "Auxiliadora",
  ],
  openGraph: {
    title: "Vitapraxis — Centro de Bem-Estar",
    description:
      "Uma equipe completa cuidando de você em todas as dimensões. Saúde, equilíbrio e bem-estar.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${serif.variable} ${sans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
