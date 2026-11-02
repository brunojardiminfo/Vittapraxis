-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "endereco" TEXT,
    "emergenciaNome" TEXT,
    "emergenciaVinculo" TEXT,
    "emergenciaFone" TEXT,
    "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
    "cashback" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "codigoIndicacao" TEXT NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profissional" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "especialidade" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "iniciais" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Profissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "beneficios" TEXT NOT NULL,
    "duracaoMin" INTEGER NOT NULL,
    "precoAvulso" DOUBLE PRECISION NOT NULL,
    "precoEmPlano" DOUBLE PRECISION,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "duracaoMin" INTEGER NOT NULL,
    "sala" TEXT,
    "status" TEXT NOT NULL,
    "checkinEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pacote" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "sessoesContratadas" INTEGER NOT NULL,
    "sessoesUtilizadas" INTEGER NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiceBemEstar" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "agendamentoId" TEXT,
    "humor" INTEGER NOT NULL,
    "sono" INTEGER NOT NULL,
    "dor" INTEGER NOT NULL,
    "observacao" TEXT,
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndiceBemEstar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolucaoClinica" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "agendamentoId" TEXT,
    "areaTratada" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,
    "orientacoes" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvolucaoClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conteudo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "publicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conteudo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicacao" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Indicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "periodo" TEXT NOT NULL,
    "diasPreferidos" TEXT,
    "observacao" TEXT,
    "status" TEXT NOT NULL,
    "respostaRecepcao" TEXT,
    "agendamentoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfissionalToServico" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfissionalToServico_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_token_key" ON "Sessao"("token");

-- CreateIndex
CREATE INDEX "Sessao_usuarioId_idx" ON "Sessao"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_codigoIndicacao_key" ON "Paciente"("codigoIndicacao");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_usuarioId_key" ON "Profissional"("usuarioId");

-- CreateIndex
CREATE INDEX "Agendamento_pacienteId_idx" ON "Agendamento"("pacienteId");

-- CreateIndex
CREATE INDEX "Agendamento_profissionalId_idx" ON "Agendamento"("profissionalId");

-- CreateIndex
CREATE INDEX "Agendamento_inicio_idx" ON "Agendamento"("inicio");

-- CreateIndex
CREATE INDEX "Pacote_pacienteId_idx" ON "Pacote"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiceBemEstar_agendamentoId_key" ON "IndiceBemEstar"("agendamentoId");

-- CreateIndex
CREATE INDEX "IndiceBemEstar_pacienteId_idx" ON "IndiceBemEstar"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "EvolucaoClinica_agendamentoId_key" ON "EvolucaoClinica"("agendamentoId");

-- CreateIndex
CREATE INDEX "EvolucaoClinica_pacienteId_idx" ON "EvolucaoClinica"("pacienteId");

-- CreateIndex
CREATE INDEX "Indicacao_pacienteId_idx" ON "Indicacao"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitacao_agendamentoId_key" ON "Solicitacao"("agendamentoId");

-- CreateIndex
CREATE INDEX "Solicitacao_pacienteId_idx" ON "Solicitacao"("pacienteId");

-- CreateIndex
CREATE INDEX "Solicitacao_status_idx" ON "Solicitacao"("status");

-- CreateIndex
CREATE INDEX "_ProfissionalToServico_B_index" ON "_ProfissionalToServico"("B");

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profissional" ADD CONSTRAINT "Profissional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacote" ADD CONSTRAINT "Pacote_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacote" ADD CONSTRAINT "Pacote_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacote" ADD CONSTRAINT "Pacote_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndiceBemEstar" ADD CONSTRAINT "IndiceBemEstar_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndiceBemEstar" ADD CONSTRAINT "IndiceBemEstar_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucaoClinica" ADD CONSTRAINT "EvolucaoClinica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucaoClinica" ADD CONSTRAINT "EvolucaoClinica_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucaoClinica" ADD CONSTRAINT "EvolucaoClinica_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicacao" ADD CONSTRAINT "Indicacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfissionalToServico" ADD CONSTRAINT "_ProfissionalToServico_A_fkey" FOREIGN KEY ("A") REFERENCES "Profissional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfissionalToServico" ADD CONSTRAINT "_ProfissionalToServico_B_fkey" FOREIGN KEY ("B") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

