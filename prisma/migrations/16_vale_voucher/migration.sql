-- AlterTable
ALTER TABLE "PedidoVale" ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "emitidoEm" TIMESTAMP(3),
ADD COLUMN     "emitidoPor" TEXT,
ADD COLUMN     "pacienteId" TEXT,
ADD COLUMN     "usadoEm" TIMESTAMP(3),
ADD COLUMN     "usadoPor" TEXT,
ADD COLUMN     "validoAte" TIMESTAMP(3),
ADD COLUMN     "voucherId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PedidoVale_codigo_key" ON "PedidoVale"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoVale_voucherId_key" ON "PedidoVale"("voucherId");

-- AddForeignKey
ALTER TABLE "PedidoVale" ADD CONSTRAINT "PedidoVale_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVale" ADD CONSTRAINT "PedidoVale_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

