-- AlterTable
ALTER TABLE "Indicacao" ADD COLUMN     "indicadoId" TEXT,
ADD COLUMN     "leadId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Indicacao_leadId_key" ON "Indicacao"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Indicacao_indicadoId_key" ON "Indicacao"("indicadoId");

-- AddForeignKey
ALTER TABLE "Indicacao" ADD CONSTRAINT "Indicacao_indicadoId_fkey" FOREIGN KEY ("indicadoId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

