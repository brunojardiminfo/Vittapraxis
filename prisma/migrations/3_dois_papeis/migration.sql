-- DropForeignKey
ALTER TABLE "Profissional" DROP CONSTRAINT "Profissional_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Solicitacao" DROP CONSTRAINT "Solicitacao_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Solicitacao" DROP CONSTRAINT "Solicitacao_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Solicitacao" DROP CONSTRAINT "Solicitacao_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "Solicitacao" DROP CONSTRAINT "Solicitacao_servicoId_fkey";

-- DropIndex
DROP INDEX "Profissional_usuarioId_key";

-- AlterTable
ALTER TABLE "EvolucaoClinica" ADD COLUMN     "anexoNome" TEXT,
ADD COLUMN     "anexoUrl" TEXT;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
-- Profissional deixa de ter login. O nome passa a viver na propria tabela,
-- entao e preciso copia-lo do Usuario vinculado ANTES de largar a relacao.
ALTER TABLE "Profissional" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Profissional" ADD COLUMN "nome" TEXT NOT NULL DEFAULT '';

UPDATE "Profissional" p SET "nome" = u."nome"
  FROM "Usuario" u WHERE p."usuarioId" = u."id";

ALTER TABLE "Profissional" ALTER COLUMN "nome" DROP DEFAULT;
ALTER TABLE "Profissional" DROP COLUMN "usuarioId";

-- Os logins de profissional e recepcao nao existem mais
DELETE FROM "Usuario" WHERE "papel" IN ('PROFISSIONAL','RECEPCAO');

-- DropTable
DROP TABLE "Solicitacao";

-- CreateTable
CREATE TABLE "PedidoAgendamento" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "periodo" TEXT NOT NULL,
    "diasPreferidos" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoAgendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "resposta" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoVale" (
    "id" TEXT NOT NULL,
    "deNome" TEXT NOT NULL,
    "deContato" TEXT NOT NULL,
    "paraNome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,
    "servicoNome" TEXT,
    "mensagem" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoVale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PedidoAgendamento_pacienteId_idx" ON "PedidoAgendamento"("pacienteId");

-- CreateIndex
CREATE INDEX "PedidoAgendamento_criadoEm_idx" ON "PedidoAgendamento"("criadoEm");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "PedidoVale_status_idx" ON "PedidoVale"("status");

-- AddForeignKey
ALTER TABLE "PedidoAgendamento" ADD CONSTRAINT "PedidoAgendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoAgendamento" ADD CONSTRAINT "PedidoAgendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoAgendamento" ADD CONSTRAINT "PedidoAgendamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

