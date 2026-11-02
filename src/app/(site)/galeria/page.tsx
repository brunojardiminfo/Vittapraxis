import { readdir } from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import { CLINICA } from "@/lib/clinica";
import { BotaoLink, Eyebrow } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeria",
  description:
    "Conheça o espaço da Vitapraxis em Auxiliadora, Porto Alegre: recepção, consultórios e salas de atendimento.",
};

/**
 * Legendas de quem já tem nome pensado. O que não estiver aqui cai no nome do
 * arquivo virado em texto — assim uma foto nova aparece na galeria só por ser
 * copiada para /public, sem precisar de deploy de código.
 */
const LEGENDAS: Record<string, string> = {
  "/clinica/recepcao.webp":
    "Recepção com parede de vegetação natural e balcão de mármore",
  "/clinica/consultorio.webp": "Consultório preparado para avaliação",
  "/clinica/sala-maca.webp": "Sala de massoterapia com maca preparada",
  "/clinica/sala-vista.webp": "Sala de atendimento com vista para a cidade",
  "/servicos/acupuntura.webp": "Sessão de acupuntura",
  "/servicos/massoterapia.webp": "Sessão de massoterapia",
  "/servicos/nutricao.webp": "Atendimento de nutrição",
  "/servicos/fisioterapia-atm.webp": "Fisioterapia da ATM",
};

const GRUPOS = [
  { pasta: "clinica", titulo: "O espaço" },
  { pasta: "servicos", titulo: "Os atendimentos" },
] as const;

/** "sala-maca.webp" → "Sala maca", para a foto sem legenda escrita. */
function legendaDoArquivo(arquivo: string) {
  const base = arquivo.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function fotosDe(pasta: string) {
  try {
    const arquivos = await readdir(path.join(process.cwd(), "public", pasta));
    return arquivos
      .filter((a) => /\.(webp|jpg|jpeg|png|avif)$/i.test(a))
      .sort()
      .map((a) => {
        const src = `/${pasta}/${a}`;
        return { src, legenda: LEGENDAS[src] ?? legendaDoArquivo(a) };
      });
  } catch {
    // Pasta ausente é normal — a galeria simplesmente não mostra esse grupo
    return [];
  }
}

export default async function GaleriaPage() {
  const grupos = await Promise.all(
    GRUPOS.map(async (g) => ({ ...g, fotos: await fotosDe(g.pasta) }))
  );

  const comFotos = grupos.filter((g) => g.fotos.length > 0);

  return (
    <main>
      {/* ---------------- ABERTURA ---------------- */}
      <section className="border-b border-line bg-sunken py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Eyebrow>Galeria</Eyebrow>
          <h1 className="max-w-3xl text-[clamp(2rem,3.6vw,2.8rem)]">
            O lugar onde o cuidado acontece
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
            Um espaço no coração do bairro {CLINICA.endereco.bairro}, pensado
            para você respirar fundo antes mesmo da sessão começar.
          </p>
        </div>
      </section>

      {/* ---------------- GRUPOS DE FOTOS ---------------- */}
      {comFotos.map((g, i) => (
        <section
          key={g.pasta}
          className={`border-b border-line py-16 ${i % 2 === 1 ? "bg-sunken" : ""}`}
        >
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <h2 className="mb-9 text-[clamp(1.5rem,2.6vw,2rem)]">{g.titulo}</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.fotos.map((f, indice) => (
                <figure
                  key={f.src}
                  className="group overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={f.src}
                      alt={f.legenda}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      // As primeiras já entram na primeira tela; o resto pode
                      // esperar o scroll
                      priority={i === 0 && indice < 3}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="px-5 py-4 text-[0.86rem] leading-relaxed text-muted">
                    {f.legenda}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ---------------- CHAMADA FINAL ---------------- */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">
            Melhor do que ver é sentir
          </h2>
          <p className="mx-auto mt-4 mb-9 text-muted">
            {CLINICA.endereco.completo}. {CLINICA.horario.resumo}.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <BotaoLink href="/contato">Agendar minha avaliação</BotaoLink>
            <a
              href={CLINICA.endereco.mapa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Ver no mapa
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
