-- CreateTable
CREATE TABLE "Destaque" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "etiqueta" TEXT,
    "imagem" TEXT,
    "link" TEXT,
    "linkTexto" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "inicioEm" TIMESTAMP(3),
    "fimEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Destaque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destaque_ativo_ordem_idx" ON "Destaque"("ativo", "ordem");

