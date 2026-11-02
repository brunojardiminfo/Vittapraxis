import Image from "next/image";
import Link from "next/link";

export type DestaqueCartao = {
  id: string;
  titulo: string;
  texto: string;
  etiqueta: string | null;
  imagem: string | null;
  link: string | null;
  linkTexto: string | null;
};

/**
 * Esteira horizontal de ofertas e avisos no topo do portal.
 *
 * Rola por scroll nativo com scroll-snap em vez de carrossel com script: o
 * dedo no celular e o trackpad já fazem o gesto, e sem JS a coisa continua
 * funcionando no primeiro render. Cada cartão trava no início da faixa.
 */
export function EsteiraDestaques({ itens }: { itens: DestaqueCartao[] }) {
  if (itens.length === 0) return null;

  return (
    <section className="mb-9" aria-label="Ofertas e novidades">
      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
        {itens.map((d) => {
          const conteudo = (
            <>
              {d.imagem ? (
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={d.imagem}
                    alt=""
                    fill
                    sizes="340px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col p-5">
                {d.etiqueta ? (
                  <span className="mb-2 inline-flex w-fit rounded-full bg-vp-gold px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-vp-green-deep">
                    {d.etiqueta}
                  </span>
                ) : null}

                <h3 className="font-sans text-[1rem] font-semibold">
                  {d.titulo}
                </h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
                  {d.texto}
                </p>

                {d.link ? (
                  <span className="mt-auto pt-3.5 text-[0.82rem] font-semibold text-accent">
                    {d.linkTexto ?? "Saiba mais"} →
                  </span>
                ) : null}
              </div>
            </>
          );

          const classe =
            "flex w-[19rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors";

          // Link externo sai em aba nova; interno usa o roteador
          if (d.link?.startsWith("http")) {
            return (
              <a
                key={d.id}
                href={d.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${classe} hover:border-accent`}
              >
                {conteudo}
              </a>
            );
          }

          if (d.link) {
            return (
              <Link
                key={d.id}
                href={d.link}
                className={`${classe} hover:border-accent`}
              >
                {conteudo}
              </Link>
            );
          }

          return (
            <div key={d.id} className={classe}>
              {conteudo}
            </div>
          );
        })}
      </div>
    </section>
  );
}
