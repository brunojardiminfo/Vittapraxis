-- AlterTable
ALTER TABLE "PedidoVale" ADD COLUMN     "servicoId" TEXT;

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL DEFAULT 'unica',
    "pontosPorSessao" INTEGER NOT NULL DEFAULT 10,
    "cashbackPorIndicacao" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "nivelOuro" INTEGER NOT NULL DEFAULT 1000,
    "nivelPlatina" INTEGER NOT NULL DEFAULT 2000,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

