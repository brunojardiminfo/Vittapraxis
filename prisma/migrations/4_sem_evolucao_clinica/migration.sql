-- DropForeignKey
ALTER TABLE "EvolucaoClinica" DROP CONSTRAINT "EvolucaoClinica_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "EvolucaoClinica" DROP CONSTRAINT "EvolucaoClinica_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "EvolucaoClinica" DROP CONSTRAINT "EvolucaoClinica_profissionalId_fkey";

-- DropTable
DROP TABLE "EvolucaoClinica";

