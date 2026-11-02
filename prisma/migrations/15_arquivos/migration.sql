-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dados" BYTEA NOT NULL,
    "largura" INTEGER NOT NULL,
    "altura" INTEGER NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

