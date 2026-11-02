import { db } from "@/lib/db";
import { Avatar, BotaoLink } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nossa Equipe" };

export default async function EquipePage() {
  const profissionais = await db.profissional.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    include: {
      servicos: { select: { id: true, nome: true } },
    },
  });

  const grupos = profissionais.reduce<Record<string, typeof profissionais>>(
    (acc, p) => {
      (acc[p.especialidade] ??= []).push(p);
      return acc;
    },
    {}
  );

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Nossa Equipe</h1>
        <p className="mt-1 text-sm text-muted">
          Profissionais de diferentes áreas trabalhando em conjunto por você
        </p>
      </header>

      {Object.entries(grupos).map(([especialidade, pessoas]) => (
        <section key={especialidade} className="mb-10 last:mb-0">
          <p className="mb-5 border-b border-line pb-3 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-brand">
            {especialidade}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {pessoas.map((p) => (
              <article
                key={p.id}
                className="flex gap-4 rounded-2xl border border-line bg-surface p-6"
              >
                <Avatar
                  iniciais={p.iniciais}
                  tamanho={56}
                  foto={p.foto}
                  nome={p.nome}
                />
                <div className="min-w-0">
                  <h2 className="font-sans text-[1.02rem] font-semibold">
                    {p.nome}
                  </h2>
                  <p className="mb-2.5 text-[0.78rem] font-semibold text-accent">
                    {p.servicos.map((s) => s.nome).join(" · ") ||
                      p.especialidade}
                  </p>
                  <p className="mb-4 text-[0.86rem] leading-relaxed text-muted">
                    {p.bio}
                  </p>
                  <BotaoLink
                    href={`/app/agendamentos/solicitar${
                      p.servicos[0] ? `?servico=${p.servicos[0].id}` : ""
                    }`}
                    tamanho="sm"
                    variante="contorno"
                  >
                    Solicitar agendamento
                  </BotaoLink>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
