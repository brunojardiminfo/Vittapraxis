import Link from "next/link";
import { pacienteDaSessao } from "@/lib/paciente";
import { dataCurta } from "@/lib/format";
import { CLINICA } from "@/lib/clinica";
import { Card, CardHead, Pill } from "@/components/ui";
import { IconeCadeado, IconePerfil } from "@/components/icones";
import { FormularioPerfil } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu Perfil" };

function Identificacao({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: string | null;
}) {
  return (
    <div>
      <dt className="mb-1 text-[0.72rem] uppercase tracking-wider text-muted">
        {rotulo}
      </dt>
      <dd className="text-[0.95rem] font-medium">
        {valor ?? <span className="text-muted">Não informado</span>}
      </dd>
    </div>
  );
}

export default async function PerfilPage() {
  const p = await pacienteDaSessao();

  return (
    <>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.9rem]">Meu Perfil</h1>
          <p className="mt-1 text-sm text-muted">
            Mantenha seus dados de contato atualizados
          </p>
        </div>
        <Link
          href="/trocar-senha"
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[0.84rem] font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          <IconeCadeado className="h-4 w-4" />
          Trocar senha
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          {/* Identificação — só leitura: conferida presencialmente pela clínica */}
          <Card className="p-7">
            <CardHead
              titulo="Identificação"
              acao={<IconePerfil className="h-4 w-4 text-accent" />}
            />
            <dl className="grid gap-5 sm:grid-cols-2">
              <Identificacao rotulo="Nome completo" valor={p.usuario.nome} />
              <Identificacao rotulo="E-mail" valor={p.usuario.email} />
              <Identificacao rotulo="CPF" valor={p.cpf} />
              <Identificacao
                rotulo="Data de nascimento"
                valor={p.dataNascimento ? dataCurta(p.dataNascimento) : null}
              />
            </dl>
            <p className="mt-5 border-t border-line pt-4 text-[0.8rem] leading-relaxed text-muted">
              Para corrigir nome, CPF ou data de nascimento, fale com a
              recepção pelo WhatsApp{" "}
              <a
                href={CLINICA.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                {CLINICA.whatsapp.exibicao}
              </a>
              .
            </p>
          </Card>

          {/* Contato — editável pelo paciente */}
          <Card className="p-7">
            <CardHead titulo="Contato" />
            <FormularioPerfil
              inicial={{
                telefone: p.telefone ?? "",
                whatsapp: p.whatsapp ?? "",
                endereco: p.endereco ?? "",
                emergenciaNome: p.emergenciaNome ?? "",
                emergenciaVinculo: p.emergenciaVinculo ?? "",
                emergenciaFone: p.emergenciaFone ?? "",
              }}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHead titulo="Clube Vitapraxis" />
            <dl className="flex flex-col gap-3.5">
              <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
                <dt className="text-[0.86rem] text-muted">Seu código</dt>
                <dd className="font-serif tracking-widest text-brand">
                  {p.codigoIndicacao}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[0.86rem] text-muted">Pontos</dt>
                <dd className="font-semibold tabular-nums">
                  {p.pontos.toLocaleString("pt-BR")}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHead
              titulo="Privacidade (LGPD)"
              acao={<IconeCadeado className="h-4 w-4 text-accent" />}
            />
            <div className="mb-3.5">
              <Pill tom={p.consentimentoLgpd ? "success" : "warning"}>
                {p.consentimentoLgpd
                  ? "Consentimento ativo"
                  : "Consentimento pendente"}
              </Pill>
            </div>
            <p className="text-[0.84rem] leading-relaxed text-muted">
              Seus dados são tratados conforme a Lei Geral de Proteção de Dados
              e acessados apenas pela equipe que cuida de você. Você pode pedir
              a exportação ou a exclusão a qualquer momento.
            </p>
            <a
              href={`mailto:${CLINICA.email}?subject=${encodeURIComponent("Solicitação LGPD")}`}
              className="mt-4 inline-block rounded-full border border-line px-5 py-2.5 text-[0.82rem] font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Solicitar meus dados
            </a>
          </Card>
        </div>
      </div>
    </>
  );
}
