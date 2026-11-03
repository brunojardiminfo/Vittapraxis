import Link from "next/link";
import { db } from "@/lib/db";
import { CLINICA } from "@/lib/clinica";
import { regrasDoClube, textoIndicacao } from "@/lib/clube";
import { Vazio } from "@/components/ui";
import { CartaoMensagem, NovaMensagem } from "./cartao";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mensagens prontas" };

export default async function MensagensPage() {
  const [regras, totalPacientes] = await Promise.all([
    regrasDoClube(),
    db.paciente.count(),
  ]);

  const mensagens = await db.mensagemPronta.findMany({
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });

  const entrada = regras.niveis[1];

  // Atalhos que a clínica escreve no texto e que viram o valor do momento:
  // mudar uma regra do Clube atualiza todas as mensagens sem reescrevê-las
  const trocas: Record<string, string> = {
    "{site}": CLINICA.site,
    "{pontosPorSessao}": String(regras.pontosPorSessao),
    "{indicacao}": textoIndicacao(regras),
    "{nivelEntrada}": entrada?.nome ?? "",
  };
  const preencher = (texto: string) =>
    texto.replace(/\{(site|pontosPorSessao|indicacao|nivelEntrada)\}/g, (k) => trocas[k] ?? k);

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

      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem]">Mensagens prontas</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Textos para colar no WhatsApp. Crie, edite e exclua à vontade — os
            números do Clube vêm das regras configuradas, então acompanham
            qualquer mudança que você fizer.
          </p>
        </div>
        <NovaMensagem />
      </header>

      <p className="mb-7 rounded-2xl bg-sunken px-5 py-4 text-[0.84rem] leading-relaxed text-muted">
        A primeira serve como resposta automática do WhatsApp Business, em
        Ferramentas comerciais. As outras são para a recepção enviar na mão, no
        momento certo. Hoje a base tem {totalPacientes}{" "}
        {totalPacientes === 1 ? "paciente" : "pacientes"}
        {entrada
          ? `, e cada sessão registrada aproxima a pessoa do nível ${entrada.nome}`
          : ""}
        .
      </p>

      {mensagens.length === 0 ? (
        <Vazio>Nenhuma mensagem ainda. Crie a primeira no botão acima.</Vazio>
      ) : (
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {mensagens.map((m) => (
            <CartaoMensagem
              key={m.id}
              linkTeste={CLINICA.whatsapp.link}
              mensagem={{
                id: m.id,
                titulo: m.titulo,
                para: m.para,
                texto: m.texto,
                pronto: preencher(m.texto),
              }}
            />
          ))}
        </ul>
      )}
    </>
  );
}
