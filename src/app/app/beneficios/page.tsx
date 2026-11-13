import Link from "next/link";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { pacienteDaSessao } from "@/lib/paciente";
import { dataCurta, moeda } from "@/lib/format";
import { convite, nivelDe, regrasDoClube, textoIndicacao } from "@/lib/clube";
import { Card, CardHead, Pill, Progress, Vazio } from "@/components/ui";
import {
  IconeEstrela,
  IconeMoeda,
  IconePerfil,
  IconePresente,
} from "@/components/icones";
import { Compartilhar } from "./compartilhar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clube de Benefícios" };

export default async function BeneficiosPage() {
  const paciente = await pacienteDaSessao();

  const [indicacoes, sessoesConcluidas, vouchers] = await Promise.all([
    db.indicacao.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { criadoEm: "desc" },
    }),
    db.agendamento.count({
      where: { pacienteId: paciente.id, status: "CONCLUIDO" },
    }),
    // Vencidos ficam de fora: o paciente não precisa ver o que já passou
    db.voucher.findMany({
      where: {
        pacienteId: paciente.id,
        status: "DISPONIVEL",
        validoAte: { gte: new Date() },
      },
      orderBy: { validoAte: "asc" },
      include: { servico: { select: { nome: true } } },
    }),
  ]);

  const regras = await regrasDoClube();
  const { atual, proximo, progresso } = nivelDe(paciente.pontos, regras);
  const confirmadas = indicacoes.filter((i) => i.status === "CONFIRMADA").length;

  // O convite precisa da URL pública real, que muda entre local e produção
  const cabecalhos = await headers();
  const host = cabecalhos.get("host") ?? "vitapraxis.com.br";
  const protocolo = host.startsWith("localhost") ? "http" : "https";
  const link = convite(paciente.codigoIndicacao, `${protocolo}://${host}`);

  return (
    <>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.9rem]">Clube de Benefícios</h1>
          <p className="mt-1 text-sm text-muted">
            Cashback, pontos e vantagens exclusivas para quem é do Clube
          </p>
        </div>
        <Link
          href="/clube"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          Como funciona o Clube →
        </Link>
      </header>

      {/* Destaque do cashback */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-vp-green px-8 py-7 text-[var(--on-brand)] dark:border dark:border-line dark:bg-sunken dark:text-ink">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--on-brand)_75%,transparent)] dark:text-muted">
            Cashback acumulado
          </p>
          <p className="font-serif text-[2.2rem] leading-tight text-vp-gold">
            {moeda(paciente.cashback)}
          </p>
          <p className="text-[0.82rem] text-[color-mix(in_srgb,var(--on-brand)_70%,transparent)] dark:text-muted">
            Use como desconto em qualquer sessão
          </p>
        </div>
        <button className="rounded-full bg-vp-gold px-7 py-3 text-sm font-semibold text-vp-green-deep transition-colors hover:bg-vp-gold-pale">
          Resgatar na próxima sessão
        </button>
      </section>

      <div className="mb-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHead
            titulo={`Nível ${atual.nome}`}
            acao={<IconeEstrela className="h-4 w-4 text-accent" />}
          />
          <p className="mb-3.5 font-serif text-[1.8rem] leading-none text-brand">
            {paciente.pontos.toLocaleString("pt-BR")}{" "}
            <span className="font-sans text-[0.8rem] text-muted">pontos</span>
          </p>
          <Progress valor={progresso} />
          <p className="mt-2 text-[0.78rem] text-muted">
            {proximo
              ? `Faltam ${(proximo.minimo - paciente.pontos).toLocaleString("pt-BR")} pontos para o nível ${proximo.nome}`
              : "Você está no nível máximo do Clube"}
          </p>
          <p className="mt-3 border-t border-line pt-3 text-[0.8rem] text-muted">
            {atual.beneficio}
          </p>
        </Card>

        <Card>
          <CardHead
            titulo="Indique e ganhe"
            acao={<IconePerfil className="h-4 w-4 text-accent" />}
          />
          <p className="mb-4 text-[0.86rem] text-muted">
            Ganhe {textoIndicacao(regras)} de quem você indicar, em
            cashback, quando a pessoa fizer essa sessão.
          </p>
          <Compartilhar
            codigo={paciente.codigoIndicacao}
            link={link.link}
            texto={link.texto}
            whatsapp={link.whatsapp}
          />
        </Card>

        <Card className="md:col-span-2 xl:col-span-1">
          <CardHead
            titulo="Como você acumula"
            acao={<IconeMoeda className="h-4 w-4 text-accent" />}
          />
          <ul className="flex flex-col gap-2.5 text-[0.86rem]">
            {[
              [
                `${sessoesConcluidas} sessões concluídas`,
                `${regras.pontosPorSessao} pts cada`,
              ],
              [
                `${confirmadas} indicações confirmadas`,
                `${regras.indicacaoPercentual.toLocaleString("pt-BR")}% da 1ª sessão`,
              ],
              [
                `Nível ${regras.niveis[regras.niveis.length - 1].nome}`,
                "1 sessão cortesia por ano",
              ],
            ].map(([label, valor]) => (
              <li key={label} className="flex justify-between gap-3">
                <span>{label}</span>
                <span className="shrink-0 font-semibold text-success">
                  {valor}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ---------------- VOUCHERS ----------------
          Só o que dá para usar agora, com a data em destaque: o prazo é a
          informação que faz a pessoa agir. */}
      {vouchers.length > 0 ? (
        <section className="mb-9">
          <div className="mb-4 flex items-center gap-2.5">
            <h2 className="text-[1.2rem]">Seus vouchers</h2>
            <Pill tom="success">{vouchers.length}</Pill>
          </div>

          <ul className="grid gap-3.5 sm:grid-cols-2">
            {vouchers.map((v) => (
              <li
                key={v.id}
                className="flex gap-4 rounded-2xl border border-accent bg-surface p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sunken text-accent">
                  <IconePresente className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-sans text-[0.95rem] font-semibold">
                    {v.titulo}
                  </h3>

                  <p className="mt-0.5 text-[0.86rem] text-accent">
                    {v.valor ? moeda(v.valor) : null}
                    {v.percentual ? `${v.percentual}% de desconto` : null}
                    {v.servico ? ` · ${v.servico.nome}` : ""}
                  </p>

                  {v.descricao ? (
                    <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
                      {v.descricao}
                    </p>
                  ) : null}

                  <p className="mt-2 text-[0.78rem] font-semibold text-muted">
                    Vale até {dataCurta(v.validoAte)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-3.5 text-[0.8rem] text-muted">
            Para usar, é só avisar na recepção no momento do atendimento.
          </p>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center gap-3.5">
          <h2 className="text-[1.2rem]">Suas Indicações</h2>
          <span className="h-px flex-1 bg-line" />
          <IconePresente className="h-4 w-4 text-accent" />
        </div>

        {indicacoes.length === 0 ? (
          <Vazio>
            Você ainda não indicou ninguém. Compartilhe seu código e comece a
            acumular.
          </Vazio>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {indicacoes.map((i) => (
              <li
                key={i.id}
                className="flex items-center gap-3.5 rounded-xl border border-line bg-surface px-5 py-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sunken">
                  <IconePerfil className="h-4 w-4 text-accent" />
                </span>
                <span className="flex-1 text-[0.9rem] font-medium">
                  {i.nome}
                </span>
                <Pill tom={i.status === "CONFIRMADA" ? "success" : "warning"}>
                  {i.status === "CONFIRMADA" ? "Confirmada" : "Pendente"}
                </Pill>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
