import Link from "next/link";
import { db } from "@/lib/db";
import { dataCurta } from "@/lib/format";
import { FormularioConteudo } from "./formulario";
import { ListaBiblioteca, type ItemBiblioteca } from "./lista";

export const dynamic = "force-dynamic";
export const metadata = { title: "Biblioteca" };

export default async function AdminBibliotecaPage() {
  const conteudos = await db.conteudo.findMany({
    orderBy: { publicadoEm: "desc" },
  });

  const itens: ItemBiblioteca[] = conteudos.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    resumo: c.resumo,
    corpo: c.corpo,
    tipo: c.tipo,
    categoria: c.categoria,
    url: c.url,
    publicadoEm: dataCurta(c.publicadoEm),
  }));

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
        <h1 className="text-[1.7rem]">Biblioteca de Saúde</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          O que a clínica publica aqui aparece na Biblioteca de Saúde do
          portal do paciente.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start [&>*]:min-w-0">
        <FormularioConteudo />

        <section>
          <h2 className="mb-4 text-[1.15rem]">
            No ar{" "}
            <span className="text-[0.85rem] font-normal text-muted">
              ({itens.length})
            </span>
          </h2>
          <ListaBiblioteca itens={itens} />
        </section>
      </div>
    </>
  );
}
