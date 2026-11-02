-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "indicacaoPercentual" DOUBLE PRECISION NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "fichaClinica" TEXT;

-- AlterTable
ALTER TABLE "Profissional" ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "exibirPreco" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "exibirPromocional" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "precoPromocional" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "trocarSenha" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Evolucao" (
    "id" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "queixa" TEXT,
    "conduta" TEXT NOT NULL,
    "evolucao" TEXT NOT NULL,
    "orientacoes" TEXT,
    "dor" INTEGER,
    "regioesDor" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensagemPronta" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "para" TEXT,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MensagemPronta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Evolucao_agendamentoId_key" ON "Evolucao"("agendamentoId");

-- CreateIndex
CREATE INDEX "Evolucao_pacienteId_criadoEm_idx" ON "Evolucao"("pacienteId", "criadoEm");

-- CreateIndex
CREATE INDEX "Evolucao_profissionalId_criadoEm_idx" ON "Evolucao"("profissionalId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_usuarioId_key" ON "Profissional"("usuarioId");

-- AddForeignKey
ALTER TABLE "Profissional" ADD CONSTRAINT "Profissional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evolucao" ADD CONSTRAINT "Evolucao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evolucao" ADD CONSTRAINT "Evolucao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evolucao" ADD CONSTRAINT "Evolucao_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Dados
-- ---------------------------------------------------------------------------

-- Faixas do Clube: Prata, Ouro e Diamante, a pedido da direção. Só renomeia
-- se a grade ainda for a de fábrica — se a clínica já mexeu, respeita.
UPDATE "NivelClube" SET "nome" = 'Diamante',
  "beneficio" = REPLACE("beneficio", 'Platina', 'Ouro')
  WHERE "nome" = 'Ouro' AND "minimo" = 2000
    AND EXISTS (SELECT 1 FROM "NivelClube" WHERE "nome" = 'Platina');
UPDATE "NivelClube" SET "nome" = 'Ouro'
  WHERE "nome" = 'Platina' AND "minimo" = 1000;

-- Mensagens que antes eram fixas no código viram registros editáveis
INSERT INTO "MensagemPronta" ("id", "titulo", "para", "texto", "ordem", "atualizadoEm") VALUES
('msg_resposta_automatica', 'Resposta automática do WhatsApp Business', 'Configurar em Ferramentas comerciais → Mensagem de ausência ou saudação', E'Olá! Aqui é da Vitapraxis 🌿\n\nVocê já conhece o Clube Vitapraxis? Cada sessão que você faz vira pontos, e indicar alguém vira crédito para usar nos seus atendimentos.\n\nPara começar a acumular, acesse o portal:\n{site}/app\n\nQualquer dúvida é só chamar por aqui.', 0, CURRENT_TIMESTAMP),
('msg_horario_confirmado', 'Depois de confirmar o horário', 'Enviar logo após combinar a sessão pelo WhatsApp', E'Horário confirmado! ✅\n\nAproveite e registre esta sessão no seu portal — é o que garante os seus pontos do Clube:\n{site}/app/agendamentos/registrar\n\nLeva menos de um minuto.', 1, CURRENT_TIMESTAMP),
('msg_pos_atendimento', 'Depois do atendimento', 'Enviar no fim do dia para quem foi atendido', E'Foi ótimo te receber hoje 🌿\n\nSua sessão já está valendo {pontosPorSessao} pontos no Clube Vitapraxis. Acompanhe seu saldo e seus benefícios no portal:\n{site}/app/beneficios\n\nAté a próxima!', 2, CURRENT_TIMESTAMP),
('msg_convite_indicar', 'Convite para indicar', 'Enviar a quem já está no Clube', E'Sabia que você ganha crédito indicando quem você gosta?\n\nQuando a pessoa que você indicar fizer a primeira sessão, você ganha {indicacao} de crédito, para usar nos seus próprios atendimentos.\n\nSeu código de indicação está aqui:\n{site}/app/beneficios', 3, CURRENT_TIMESTAMP),
('msg_para_quem_sumiu', 'Para quem sumiu', 'Enviar a quem está fora do radar no painel', E'Oi! Sentimos sua falta na Vitapraxis 🌿\n\nFaz um tempinho desde sua última sessão. Que tal marcarmos um retorno para ver como você está?\n\nÉ só responder esta mensagem que a gente encontra um horário.', 4, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Conta da administração com senha provisória: a troca é obrigatória no
-- primeiro acesso. A senha antiga de demonstração deixa de valer.
INSERT INTO "Usuario" ("id", "email", "senhaHash", "nome", "papel", "trocarSenha")
VALUES ('usr_admin_vitapraxis', 'admin@vitapraxis.com.br', '$2a$10$E/V1hcUsRno3wLsG7UMSsufEC5ocvMFn9rzpAYLHF1C1PBFyNjUKm', 'Direção Vitapraxis', 'ADMIN', true)
ON CONFLICT ("email") DO UPDATE SET "senhaHash" = EXCLUDED."senhaHash", "papel" = 'ADMIN', "trocarSenha" = true;

-- Sessões abertas com a senha antiga caem junto
DELETE FROM "Sessao" WHERE "usuarioId" IN (SELECT "id" FROM "Usuario" WHERE "email" = 'admin@vitapraxis.com.br');
