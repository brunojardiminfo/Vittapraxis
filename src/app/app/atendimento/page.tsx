import { db } from "@/lib/db";
import { pacienteDaSessao, primeiroNome } from "@/lib/paciente";
import { Card, Vazio } from "@/components/ui";
import {
  IconeChat,
  IconeLocal,
  IconeRelogio,
  IconeTelefone,
} from "@/components/icones";
import { CLINICA } from "@/lib/clinica";
import { Chatbot } from "./chatbot";

export const dynamic = "force-dynamic";
export const metadata = { title: "Central de Atendimento" };

const CANAIS = [
  {
    Icone: IconeChat,
    titulo: "WhatsApp",
    detalhe: CLINICA.whatsapp.exibicao,
    href: CLINICA.whatsapp.link,
  },
  {
    Icone: IconeTelefone,
    titulo: "Telefone",
    detalhe: CLINICA.telefone.exibicao,
    href: CLINICA.telefone.link,
  },
  {
    Icone: IconeLocal,
    titulo: "Onde estamos",
    detalhe: CLINICA.endereco.curto,
    href: CLINICA.endereco.mapa,
  },
  {
    Icone: IconeRelogio,
    titulo: "Horário",
    detalhe: CLINICA.horario.curto,
    href: null,
  },
];

export default async function AtendimentoPage() {
  const [paciente, faqs] = await Promise.all([
    pacienteDaSessao(),
    db.faq.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  return (
    <>
      <header className="mb-7">
        <h1 className="text-[1.9rem]">Central de Atendimento</h1>
        <p className="mt-1 text-sm text-muted">
          Fale com a equipe ou tire dúvidas rápidas
        </p>
      </header>

      <div className="mb-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CANAIS.map(({ Icone, titulo, detalhe, href }) => {
          const conteudo = (
            <>
              <Icone className="mb-2.5 h-5 w-5 text-accent" />
              <p className="text-[0.86rem] font-semibold">{titulo}</p>
              <p className="text-[0.78rem] text-muted">{detalhe}</p>
            </>
          );
          const classe =
            "flex flex-col rounded-2xl border border-line bg-surface p-5 transition-all";

          return href ? (
            <a
              key={titulo}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${classe} hover:-translate-y-0.5 hover:border-accent`}
            >
              {conteudo}
            </a>
          ) : (
            <div key={titulo} className={classe}>
              {conteudo}
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Card className="p-7">
          <h2 className="mb-4 text-[1.15rem]">Perguntas Frequentes</h2>
          {faqs.length === 0 ? (
            <Vazio>Nenhuma pergunta cadastrada.</Vazio>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {faqs.map((f, i) => (
                <details key={f.id} open={i === 0} className="group py-1">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-3.5 text-[0.94rem] font-semibold marker:content-['']">
                    {f.pergunta}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="pb-4 text-[0.88rem] leading-relaxed text-muted">
                    {f.resposta}
                  </p>
                </details>
              ))}
            </div>
          )}
        </Card>

        <Chatbot primeiroNome={primeiroNome(paciente.usuario.nome)} />
      </div>
    </>
  );
}
