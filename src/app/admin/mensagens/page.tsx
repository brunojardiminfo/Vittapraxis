import Link from "next/link";
import { db } from "@/lib/db";
import { CLINICA } from "@/lib/clinica";
import { regrasDoClube } from "@/lib/clube";
import { Copiar } from "./copiar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mensagens prontas" };

export default async function MensagensPage() {
  const [regras, totalPacientes] = await Promise.all([
    regrasDoClube(),
    db.paciente.count(),
  ]);

  const site = "https://vita-praxis.vercel.app";
  const entrada = regras.niveis[1];

  const modelos = [
    {
      titulo: "Resposta automática do WhatsApp Business",
      para: "Configurar em Ferramentas comerciais → Mensagem de ausência ou saudação",
      texto: `Olá! Aqui é da Vitapraxis 🌿

Você já conhece o Clube Vitapraxis? Cada sessão que você faz vira pontos, e indicar alguém vira crédito para usar nos seus atendimentos.

Para começar a acumular, registre suas sessões no portal:
${site}/app/agendamentos

Qualquer dúvida é só chamar por aqui.`,
    },
    {
      titulo: "Depois de confirmar o horário",
      para: "Enviar logo após combinar a sessão pelo WhatsApp",
      texto: `Horário confirmado! ✅

Aproveite e registre esta sessão no seu portal — é o que garante os seus pontos do Clube:
${site}/app/agendamentos/registrar

Leva menos de um minuto.`,
    },
    {
      titulo: "Depois do atendimento",
      para: "Enviar no fim do dia para quem foi atendido",
      texto: `Foi ótimo te receber hoje 🌿

Sua sessão já está valendo ${regras.pontosPorSessao} pontos no Clube Vitapraxis. Acompanhe seu saldo e seus benefícios no portal:
${site}/app/beneficios

Até a próxima!`,
    },
    {
      titulo: "Convite para indicar",
      para: "Enviar a quem já está no Clube",
      texto: `Sabia que você ganha crédito indicando quem você gosta?

Quando a pessoa que você indicar fizer a primeira sessão, entram R$ ${regras.cashbackPorIndicacao.toFixed(2).replace(".", ",")} de crédito na sua conta, para usar nos seus próprios atendimentos.

Seu código de indicação está aqui:
${site}/app/beneficios`,
    },
    {
      titulo: "Para quem sumiu",
      para: "Enviar a quem está fora do radar no painel",
      texto: `Oi! Sentimos sua falta na Vitapraxis 🌿

Faz um tempinho desde sua última sessão. Que tal marcarmos um retorno para ver como anda sua coluna?

É só responder esta mensagem que a gente encontra um horário.`,
    },
    {
      titulo: "Primeiro acesso ao portal",
      para: "Enviar junto com a senha, no cadastro",
      texto: `Seu acesso ao portal da Vitapraxis está pronto! 🌿

Lá você acompanha suas sessões, seu saldo do Clube e seus vouchers.

Acesse em ${site}/entrar com o seu e-mail e a senha que combinamos — e troque a senha no primeiro acesso, em Meu Perfil.`,
    },
  ];

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
        <h1 className="text-[1.7rem]">Mensagens prontas</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Textos para colar no WhatsApp. Os números do Clube vêm das regras
          configuradas, então acompanham qualquer mudança que você fizer.
        </p>
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

      <ul className="grid gap-5 lg:grid-cols-2">
        {modelos.map((m) => (
          <li
            key={m.titulo}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="font-sans text-[1rem] font-semibold">{m.titulo}</h2>
            <p className="mt-1 text-[0.8rem] text-muted">{m.para}</p>

            <pre className="mt-4 flex-1 whitespace-pre-wrap rounded-xl bg-sunken px-4 py-3.5 font-sans text-[0.86rem] leading-relaxed">
              {m.texto}
            </pre>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Copiar texto={m.texto} />
              <a
                href={`${CLINICA.whatsapp.link}?text=${encodeURIComponent(m.texto)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                Testar no WhatsApp
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
