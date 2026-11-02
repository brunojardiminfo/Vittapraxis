-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pontos" INTEGER;

-- CreateTable
CREATE TABLE "LancamentoClube" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "autor" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agendamentoId" TEXT,
    "indicacaoId" TEXT,

    CONSTRAINT "LancamentoClube_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LancamentoClube_agendamentoId_key" ON "LancamentoClube"("agendamentoId");

-- CreateIndex
CREATE INDEX "LancamentoClube_pacienteId_criadoEm_idx" ON "LancamentoClube"("pacienteId", "criadoEm");

-- AddForeignKey
ALTER TABLE "LancamentoClube" ADD CONSTRAINT "LancamentoClube_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoClube" ADD CONSTRAINT "LancamentoClube_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoClube" ADD CONSTRAINT "LancamentoClube_indicacaoId_fkey" FOREIGN KEY ("indicacaoId") REFERENCES "Indicacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

