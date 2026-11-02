-- AlterTable
ALTER TABLE "Profissional" ADD COLUMN     "credencial" TEXT,
ADD COLUMN     "ehDiretor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "foto" TEXT;

