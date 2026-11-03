import { readdir } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { db } from "@/lib/db";
import { haQuantoTempo } from "@/lib/format";
import { FormularioProfissional } from "./formulario";
import { ListaEquipe, type ItemEquipe } from "./lista";

export const dynamic = "force-dynamic";
export const metadata = { title: "Equipe" };

/** Fotos já publicadas em /public/equipe. */
async function fotosDisponiveis() {
  try {
    const arquivos = await readdir(
      path.join(process.cwd(), "public", "equipe")
    );
    return arquivos
      .filter((a) => /\.(webp|jpg|jpeg|png|avif)$/i.test(a))
      .sort()
      .map((a) => `/equipe/${a}`);
  } catch {
    return [];
  }
}

export default async function AdminEquipePage() {
  const [profissionais, servicos, fotos] = await Promise.all([
    db.profissional.findMany({
      orderBy: [{ ativo: "desc" }, { ordem: "asc" }, { nome: "asc" }],
      include: {
        servicos: { select: { id: true, nome: true } },
        usuario: { select: { id: true, email: true, ultimoAcesso: true } },
        _count: { select: { agendamentos: true } },
      },
    }),
    db.servico.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      select: { id: true, nome: true },
    }),
    fotosDisponiveis(),
  ]);

  const itens: ItemEquipe[] = profissionais.map((p) => ({
    id: p.id,
    nome: p.nome,
    especialidade: p.especialidade,
    bio: p.bio,
    credencial: p.credencial,
    foto: p.foto,
    ordem: p.ordem,
    ativo: p.ativo,
    servicos: p.servicos.map((s) => s.id),
    nomesServicos: p.servicos.map((s) => s.nome),
    sessoes: p._count.agendamentos,
    acesso: p.usuario
      ? {
          id: p.usuario.id,
          email: p.usuario.email,
          ultimoAcesso: haQuantoTempo(p.usuario.ultimoAcesso),
        }
      : null,
  }));

  const semServico = itens.filter(
    (p) => p.ativo && p.nomesServicos.length === 0
  ).length;

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
        <h1 className="text-[1.7rem]">Equipe</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Quem atende, em que especialidade e quais serviços. É daqui que sai a
          lista de profissionais que o paciente vê ao escolher um serviço — e
          é aqui que se cria o login de cada um no Portal do Profissional.
        </p>
      </header>

      {semServico > 0 ? (
        <p className="mb-6 rounded-2xl bg-warning-bg px-5 py-4 text-[0.86rem] font-medium text-warning">
          {semServico}{" "}
          {semServico === 1
            ? "profissional está sem serviço vinculado e não aparece"
            : "profissionais estão sem serviço vinculado e não aparecem"}{" "}
          para o paciente escolher.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start [&>*]:min-w-0">
        <FormularioProfissional servicos={servicos} fotos={fotos} />

        <section>
          <h2 className="mb-4 text-[1.15rem]">
            Cadastrados{" "}
            <span className="text-[0.85rem] font-normal text-muted">
              ({itens.length})
            </span>
          </h2>
          <ListaEquipe itens={itens} servicos={servicos} fotos={fotos} />
        </section>
      </div>
    </>
  );
}
