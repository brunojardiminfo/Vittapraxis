-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "interesse" TEXT,
    "mensagem" TEXT,
    "origem" TEXT NOT NULL DEFAULT 'SITE',
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

