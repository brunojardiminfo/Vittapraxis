-- AlterTable
ALTER TABLE "Configuracao" DROP COLUMN "nivelOuro",
DROP COLUMN "nivelPlatina",
ADD COLUMN     "pontosCadastro" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "pontosPorPacote" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "validadeCreditoMeses" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "vouchersAniversarioAno" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "pontosPorSessao" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "descontoAniversario" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "NivelClube" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "minimo" INTEGER NOT NULL,
    "beneficio" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NivelClube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "percentual" DOUBLE PRECISION,
    "valor" DOUBLE PRECISION,
    "servicoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "validoDe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validoAte" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "usadoPor" TEXT,
    "indicacaoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sorteio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "premio" TEXT NOT NULL,
    "nivelMinimo" TEXT,
    "inicioEm" TIMESTAMP(3) NOT NULL,
    "fimEm" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "sorteadoEm" TIMESTAMP(3),
    "sorteadoPor" TEXT,
    "ganhadorId" TEXT,
    "participantes" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sorteio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NivelClube_nome_key" ON "NivelClube"("nome");

-- CreateIndex
CREATE INDEX "NivelClube_minimo_idx" ON "NivelClube"("minimo");

-- CreateIndex
CREATE INDEX "Voucher_pacienteId_status_idx" ON "Voucher"("pacienteId", "status");

-- CreateIndex
CREATE INDEX "Voucher_validoAte_idx" ON "Voucher"("validoAte");

-- CreateIndex
CREATE INDEX "Sorteio_status_idx" ON "Sorteio"("status");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorteio" ADD CONSTRAINT "Sorteio_ganhadorId_fkey" FOREIGN KEY ("ganhadorId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- As faixas que antes eram colunas fixas viram linhas editáveis.
-- Degrau "a partir de": Prata abre o Clube, Platina acima de 1.000 pontos e
-- Ouro acima de 2.000, conforme a grade definida pela direção.
INSERT INTO "NivelClube" ("id", "nome", "minimo", "beneficio", "ordem")
VALUES
  ('nivel_prata',   'Prata',   0,    'Acesso ao Clube, campanhas promocionais mensais e voucher de indicação', 0),
  ('nivel_platina', 'Platina', 1000, 'Tudo do Prata mais participação nos sorteios mensais',                   1),
  ('nivel_ouro',    'Ouro',    2000, 'Tudo do Platina mais o voucher especial de aniversário',                 2)
ON CONFLICT ("nome") DO NOTHING;
