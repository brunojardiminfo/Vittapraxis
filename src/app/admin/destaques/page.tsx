import { readdir } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta } from "@/lib/format";
import { FormularioDestaque } from "./formulario";
import { ListaDestaques, type ItemDestaque } from "./lista";

export const dynamic = "force-dynamic";
export const metadata = { title: "Destaques" };

/**
 * Varre as imagens já publicadas em /public para oferecer num select.
 *
 * Não há upload aqui: subir arquivo pediria armazenamento externo, e a
 * clínica troca essas fotos raramente. Enquanto isso, escolher entre o que já
 * existe cobre o caso e evita link quebrado por caminho digitado errado.
 */
async function imagensDisponiveis() {
  const raiz = path.join(process.cwd(), "public");
  const pastas = ["clinica", "servicos"];
  const achadas: string[] = [];

  for (const pasta of pastas) {
    try {
      const arquivos = await readdir(path.join(raiz, pasta));
      for (const a of arquivos) {
        if (/\.(webp|jpg|jpeg|png|avif)$/i.test(a)) {
          achadas.push(`/${pasta}/${a}`);
        }
      }
    } catch {
      // pasta ausente é normal — segue com o que houver
    }
  }

  return achadas.sort();
}

export default async function AdminDestaquesPage() {
  const [destaques, imagens, arquivos] = await Promise.all([
    db.destaque.findMany({ orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }] }),
    imagensDisponiveis(),
    db.arquivo.findMany({
      orderBy: { criadoEm: "desc" },
      take: 40,
      select: { id: true, nome: true },
    }),
  ]);

  const enviadas = arquivos.map((a) => ({
    id: a.id,
    nome: a.nome,
    caminho: `/api/arquivo/${a.id}`,
  }));

  const agora = new Date();
  const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

  // A situação é calculada aqui porque o componente da lista é client e não
  // deve receber Date cru nem repetir a regra de janela.
  const itens: ItemDestaque[] = destaques.map((d) => {
    const venceu = d.fimEm !== null && d.fimEm < agora;
    const aindaNao = d.inicioEm !== null && d.inicioEm > agora;

    return {
      id: d.id,
      titulo: d.titulo,
      texto: d.texto,
      etiqueta: d.etiqueta,
      imagem: d.imagem,
      link: d.link,
      linkTexto: d.linkTexto,
      ordem: d.ordem,
      inicioEm: iso(d.inicioEm),
      fimEm: iso(d.fimEm),
      ativo: d.ativo,
      situacao: !d.ativo
        ? "Desligado"
        : venceu
          ? "Vencido"
          : aindaNao
            ? "Agendado"
            : "No ar",
      periodo:
        (d.inicioEm ? ` · de ${dataCurta(d.inicioEm)}` : "") +
        (d.fimEm ? ` · até ${dataCurta(d.fimEm)}` : ""),
    };
  });

  return (
    <>
      <nav className="mb-5">
        <Link
          href="/admin"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Visão geral
        </Link>
      </nav>

      <header className="mb-7">
        <h1 className="text-[1.7rem]">Ofertas e Destaques</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Cartões que rolam no topo da tela inicial do paciente. Servem para
          promoção, pacote novo, aviso de férias — o que a clínica quiser
          contar a quem já é cliente.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start [&>*]:min-w-0">
        <FormularioDestaque imagens={imagens} enviadas={enviadas} />

        <section>
          <h2 className="mb-4 text-[1.15rem]">
            Cartões{" "}
            <span className="text-[0.85rem] font-normal text-muted">
              ({destaques.length})
            </span>
          </h2>

          <ListaDestaques imagens={imagens} enviadas={enviadas} itens={itens} />
        </section>
      </div>
    </>
  );
}
