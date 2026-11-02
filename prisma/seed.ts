import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Datas do seed são relativas a hoje, para a agenda do dia nunca ficar vazia. */
function hoje(hora: number, minuto = 0) {
  const d = new Date();
  d.setHours(hora, minuto, 0, 0);
  return d;
}
function emDias(dias: number, hora: number, minuto = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return d;
}

async function main() {
  console.log("Limpando base…");
  await prisma.pedidoAgendamento.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.indiceBemEstar.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.pacote.deleteMany();
  await prisma.indicacao.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.profissional.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.conteudo.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash("vitapraxis", 10);

  // -------------------------------------------------------------------------
  // Equipe multidisciplinar — 11 profissionais do portfólio
  // -------------------------------------------------------------------------
  console.log("Criando equipe…");

  const kleber = await prisma.profissional.create({
    data: {
      especialidade: "Quiropraxia",
      iniciais: "KF",
      foto: "/equipe/kleber-fontolan.webp",
      ehDiretor: true,
      credencial: "20 anos de experiência",
      ordem: 1,
      bio: "Avaliação funcional detalhada e planos terapêuticos individualizados para correção postural e alívio de dores na coluna.",
      nome: "Kleber Fontolan",
    },
  });

  const gustavoCora = await prisma.profissional.create({
    data: {
      especialidade: "Quiropraxia",
      iniciais: "GC",
      ordem: 2,
      bio: "Correção postural e alívio de dores articulares com técnicas de ajuste manual baseadas em evidências.",
      nome: "Gustavo Corá",
    },
  });

  const gustavoWeimer = await prisma.profissional.create({
    data: {
      especialidade: "Quiropraxia",
      iniciais: "GW",
      foto: "/equipe/gustavo-weimer.webp",
      ordem: 3,
      bio: "Tratamento de coluna e reabilitação funcional, com acompanhamento próximo da evolução de cada paciente.",
      nome: "Gustavo Weimer",
    },
  });

  const fernanda = await prisma.profissional.create({
    data: {
      especialidade: "Massoterapia",
      iniciais: "FO",
      foto: "/equipe/fernanda-oliveira.webp",
      ordem: 4,
      bio: "Técnicas de relaxamento profundo e liberação de tensões musculares acumuladas pela rotina.",
      nome: "Fernanda de Oliveira",
    },
  });

  const cristhiele = await prisma.profissional.create({
    data: {
      especialidade: "Massoterapia",
      iniciais: "CW",
      foto: "/equipe/cristhiele-woszezenki.webp",
      ordem: 5,
      bio: "Sessões Legacy e protocolo específico para contraturas, com planos a partir de 6 sessões.",
      nome: "Cristhiele T. Woszezenki",
    },
  });

  const wanessa = await prisma.profissional.create({
    data: {
      especialidade: "Massoterapia",
      iniciais: "WW",
      foto: "/equipe/wanessa-wehr.webp",
      ordem: 6,
      bio: "Massagem terapêutica voltada ao bem-estar, recuperação muscular e qualidade do sono.",
      nome: "Wanessa Wehr",
    },
  });

  const evandro = await prisma.profissional.create({
    data: {
      especialidade: "Liberação Miofascial Esportiva",
      iniciais: "ES",
      ordem: 7,
      bio: "Especialista em técnicas de Liberação Miofascial na área esportiva. Atende atletas, esportistas e apaixonados por atividade física.",
      nome: "Evandro Sajdak",
    },
  });

  const mariana = await prisma.profissional.create({
    data: {
      especialidade: "Acupuntura",
      iniciais: "MZ",
      foto: "/equipe/mariana-zabadal.webp",
      ordem: 8,
      bio: "Equilíbrio energético e alívio de dores crônicas unindo técnicas milenares a conhecimento clínico moderno.",
      nome: "Mariana Zabadal",
    },
  });

  const juliana = await prisma.profissional.create({
    data: {
      especialidade: "Nutrição",
      iniciais: "JD",
      foto: "/equipe/juliana-deitos.webp",
      ordem: 9,
      bio: "Planos alimentares personalizados que consideram rotina, objetivos e histórico de cada paciente.",
      nome: "Juliana Deitos",
    },
  });

  const marcia = await prisma.profissional.create({
    data: {
      especialidade: "Fisioterapia ATM",
      iniciais: "MV",
      foto: "/equipe/marcia-valiente.webp",
      ordem: 10,
      bio: "Tratamento especializado de disfunções temporomandibulares, bruxismo e dores orofaciais associadas.",
      nome: "Marcia Valiente",
    },
  });

  const claudimir = await prisma.profissional.create({
    data: {
      especialidade: "Iridologia",
      iniciais: "CL",
      foto: "/equipe/claudimir-lang.webp",
      ordem: 11,
      bio: "Avaliação complementar através da análise da íris, integrada ao plano terapêutico multidisciplinar.",
      nome: "Claudimir Lang",
    },
  });

  // -------------------------------------------------------------------------
  // Serviços — valores reais da tabela de investimento do portfólio
  // -------------------------------------------------------------------------
  console.log("Criando serviços…");

  const quiropraxia = await prisma.servico.create({
    data: {
      nome: "Quiropraxia",
      categoria: "Quiropraxia",
      ordem: 1,
      duracaoMin: 40,
      precoAvulso: 280,
      precoEmPlano: 180,
      descricao:
        "Ajustes manuais que restauram o alinhamento da coluna, aliviam dores articulares e devolvem mobilidade ao dia a dia.",
      beneficios:
        "Alívio de dores na coluna|Correção postural|Mais mobilidade articular|Redução de tensões|Planos a partir de 6 sessões",
      profissionais: {
        connect: [{ id: kleber.id }, { id: gustavoCora.id }, { id: gustavoWeimer.id }],
      },
    },
  });

  const massoterapia = await prisma.servico.create({
    data: {
      nome: "Massoterapia",
      categoria: "Massoterapia",
      ordem: 2,
      duracaoMin: 50,
      precoAvulso: 180,
      precoEmPlano: 162,
      descricao:
        "Massagem terapêutica que libera tensões acumuladas, melhora a circulação e promove relaxamento profundo.",
      beneficios:
        "Relaxamento profundo|Liberação de tensões musculares|Melhora da circulação|Redução do estresse|Planos a partir de 5 sessões",
      profissionais: {
        connect: [{ id: fernanda.id }, { id: cristhiele.id }, { id: wanessa.id }],
      },
    },
  });

  const miofascial = await prisma.servico.create({
    data: {
      nome: "Liberação Miofascial",
      categoria: "Liberação Miofascial",
      ordem: 3,
      duracaoMin: 60,
      precoAvulso: 180,
      precoEmPlano: 225,
      descricao:
        "Técnicas avançadas para atletas e praticantes de atividade física: melhora o desempenho, previne lesões e acelera a recuperação. Sessões de 1h, 1h30 e 2h.",
      beneficios:
        "Melhora do desempenho|Prevenção de lesões|Alívio de dores e tensões|Recuperação acelerada|Mais mobilidade e flexibilidade|Redução de inflamações|Equilíbrio corpo e mente",
      profissionais: { connect: [{ id: evandro.id }] },
    },
  });

  const acupuntura = await prisma.servico.create({
    data: {
      nome: "Acupuntura",
      categoria: "Acupuntura",
      ordem: 4,
      duracaoMin: 45,
      precoAvulso: 200,
      precoEmPlano: null,
      descricao:
        "Estímulo de pontos específicos para reequilibrar a energia vital, aliviar dores crônicas e reduzir a ansiedade.",
      beneficios:
        "Alívio de dores crônicas|Redução da ansiedade|Melhora do sono|Equilíbrio energético",
      profissionais: { connect: [{ id: mariana.id }] },
    },
  });

  const nutricao = await prisma.servico.create({
    data: {
      nome: "Nutrição",
      categoria: "Nutrição",
      ordem: 5,
      duracaoMin: 50,
      precoAvulso: 300,
      precoEmPlano: 270,
      descricao:
        "Acompanhamento nutricional individualizado, alinhado aos seus objetivos, rotina e preferências alimentares.",
      beneficios:
        "Plano alimentar personalizado|Mais energia no dia a dia|Suporte à imunidade|Acompanhamento contínuo|Plano a partir de 4 sessões",
      profissionais: { connect: [{ id: juliana.id }] },
    },
  });

  const fisioAtm = await prisma.servico.create({
    data: {
      nome: "Fisioterapia ATM",
      categoria: "Fisioterapia ATM",
      ordem: 6,
      duracaoMin: 40,
      precoAvulso: 270,
      precoEmPlano: null,
      descricao:
        "Tratamento das disfunções da articulação temporomandibular, incluindo bruxismo, estalos e dores ao mastigar.",
      beneficios:
        "Alívio de dores na mandíbula|Redução do bruxismo|Melhora da abertura bucal|Menos dores de cabeça",
      profissionais: { connect: [{ id: marcia.id }] },
    },
  });

  const iridologia = await prisma.servico.create({
    data: {
      nome: "Iridologia",
      categoria: "Iridologia",
      ordem: 7,
      duracaoMin: 40,
      precoAvulso: 200,
      precoEmPlano: null,
      descricao:
        "Avaliação complementar pela análise da íris, usada para orientar o plano terapêutico multidisciplinar.",
      beneficios:
        "Avaliação complementar|Visão integrada da saúde|Apoio ao plano terapêutico",
      profissionais: { connect: [{ id: claudimir.id }] },
    },
  });

  // -------------------------------------------------------------------------
  // Administração — opera a plataforma
  // -------------------------------------------------------------------------
  console.log("Criando administração…");


  await prisma.usuario.create({
    data: {
      email: "admin@vitapraxis.com.br",
      nome: "Direção Vitapraxis",
      papel: "ADMIN",
      senhaHash,
    },
  });

  // Regras do Clube — a administração ajusta pela tela de configurações
  await prisma.configuracao.upsert({
    where: { id: "unica" },
    create: { id: "unica" },
    update: {},
  });

  // -------------------------------------------------------------------------
  // Paciente de demonstração
  // -------------------------------------------------------------------------
  console.log("Criando paciente…");

  const sofia = await prisma.paciente.create({
    data: {
      cpf: "•••.•••.•••-12",
      telefone: "(51) 99812-4521",
      dataNascimento: new Date("1990-03-14"),
      endereco: "R. Mostardeiro, 240 — Moinhos de Vento, Porto Alegre/RS",
      emergenciaNome: "Roberto Garcia",
      emergenciaVinculo: "Cônjuge",
      emergenciaFone: "(51) 99760-8890",
      consentimentoLgpd: true,
      cashback: 145.8,
      pontos: 1240,
      codigoIndicacao: "SOFIA-VP26",
      usuario: {
        create: {
          email: "sofia@exemplo.com",
          nome: "Sofia Garcia",
          papel: "PACIENTE",
          senhaHash,
        },
      },
    },
  });

  // Outros pacientes, para a agenda do profissional ter movimento
  const outrosPacientes = await Promise.all(
    [
      { nome: "Rafael Nogueira", email: "rafael@exemplo.com", codigo: "RAFA-VP26" },
      { nome: "Camila Rossi", email: "camila@exemplo.com", codigo: "CAMI-VP26" },
      { nome: "Bruno Alencar", email: "bruno.a@exemplo.com", codigo: "BRUN-VP26" },
      { nome: "Larissa Prado", email: "larissa@exemplo.com", codigo: "LARI-VP26" },
      { nome: "Diego Martins", email: "diego@exemplo.com", codigo: "DIEG-VP26" },
    ].map((p) =>
      prisma.paciente.create({
        data: {
          codigoIndicacao: p.codigo,
          consentimentoLgpd: true,
          usuario: {
            create: { email: p.email, nome: p.nome, papel: "PACIENTE", senhaHash },
          },
        },
      })
    )
  );
  const [rafael, camila, brunoA, larissa, diego] = outrosPacientes;

  // -------------------------------------------------------------------------
  // Agenda
  // -------------------------------------------------------------------------
  console.log("Criando agendamentos…");

  // Agenda de hoje do Evandro (painel do profissional)
  const agHoje14 = await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: evandro.id,
      servicoId: miofascial.id,
      inicio: hoje(14, 0),
      duracaoMin: 60,
      sala: "Sala 3",
      status: "EM_ATENDIMENTO",
      checkinEm: hoje(13, 52),
    },
  });

  await prisma.agendamento.createMany({
    data: [
      {
        pacienteId: brunoA.id,
        profissionalId: evandro.id,
        servicoId: miofascial.id,
        inicio: hoje(9, 0),
        duracaoMin: 120,
        sala: "Sala 3",
        status: "CONCLUIDO",
      },
      {
        pacienteId: larissa.id,
        profissionalId: evandro.id,
        servicoId: miofascial.id,
        inicio: hoje(10, 30),
        duracaoMin: 60,
        sala: "Sala 3",
        status: "CONCLUIDO",
      },
      {
        pacienteId: diego.id,
        profissionalId: evandro.id,
        servicoId: miofascial.id,
        inicio: hoje(12, 0),
        duracaoMin: 90,
        sala: "Sala 3",
        status: "CONCLUIDO",
      },
      {
        pacienteId: rafael.id,
        profissionalId: evandro.id,
        servicoId: miofascial.id,
        inicio: hoje(15, 15),
        duracaoMin: 90,
        sala: "Sala 3",
        status: "AGENDADO",
      },
      {
        pacienteId: camila.id,
        profissionalId: evandro.id,
        servicoId: miofascial.id,
        inicio: hoje(17, 0),
        duracaoMin: 60,
        sala: "Sala 3",
        status: "CONFIRMADO",
      },
    ],
  });

  // Próximos agendamentos da Sofia (app do paciente)
  await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: mariana.id,
      servicoId: acupuntura.id,
      inicio: emDias(2, 14, 0),
      duracaoMin: 45,
      sala: "Sala 2",
      status: "CONFIRMADO",
    },
  });
  await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: evandro.id,
      servicoId: miofascial.id,
      inicio: emDias(7, 10, 30),
      duracaoMin: 60,
      sala: "Sala 3",
      status: "AGENDADO",
    },
  });
  await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: juliana.id,
      servicoId: nutricao.id,
      inicio: emDias(14, 9, 0),
      duracaoMin: 50,
      sala: "Sala 1",
      status: "CONFIRMADO",
    },
  });

  // Histórico da Sofia
  const agPassado1 = await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: evandro.id,
      servicoId: miofascial.id,
      inicio: emDias(-10, 10, 30),
      duracaoMin: 60,
      sala: "Sala 3",
      status: "CONCLUIDO",
    },
  });
  const agPassado2 = await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: gustavoWeimer.id,
      servicoId: quiropraxia.id,
      inicio: emDias(-21, 16, 0),
      duracaoMin: 40,
      sala: "Sala 4",
      status: "CONCLUIDO",
    },
  });
  await prisma.agendamento.create({
    data: {
      pacienteId: sofia.id,
      profissionalId: fernanda.id,
      servicoId: massoterapia.id,
      inicio: emDias(-36, 11, 0),
      duracaoMin: 50,
      sala: "Sala 1",
      status: "CANCELADO",
    },
  });

  // -------------------------------------------------------------------------
  // Histórico dos últimos dois meses — dá substância ao painel da direção,
  // que compara mês atual contra anterior e distribui por profissional.
  // -------------------------------------------------------------------------
  console.log("Criando histórico de atendimentos…");

  const combinacoes = [
    { prof: kleber, servico: quiropraxia },
    { prof: gustavoCora, servico: quiropraxia },
    { prof: gustavoWeimer, servico: quiropraxia },
    { prof: fernanda, servico: massoterapia },
    { prof: cristhiele, servico: massoterapia },
    { prof: wanessa, servico: massoterapia },
    { prof: evandro, servico: miofascial },
    { prof: mariana, servico: acupuntura },
    { prof: juliana, servico: nutricao },
    { prof: marcia, servico: fisioAtm },
    { prof: claudimir, servico: iridologia },
  ];

  const todosPacientes = [sofia, rafael, camila, brunoA, larissa, diego];
  const horarios = [8, 9, 10, 11, 14, 15, 16, 17];

  // Gerador determinístico: o seed precisa render o mesmo resultado a cada run
  let semente = 7;
  const proximo = (limite: number) => {
    semente = (semente * 1103515245 + 12345) % 2147483648;
    return semente % limite;
  };

  const historicoAgendamentos: {
    pacienteId: string;
    profissionalId: string;
    servicoId: string;
    inicio: Date;
    duracaoMin: number;
    sala: string;
    status: string;
  }[] = [];

  // 55 dias para trás cobre o mês atual e boa parte do anterior
  for (let diasAtras = 1; diasAtras <= 55; diasAtras++) {
    const data = new Date();
    data.setDate(data.getDate() - diasAtras);
    // Clínica não atende domingo
    if (data.getDay() === 0) continue;

    const sessoesNoDia = 2 + proximo(3);
    for (let i = 0; i < sessoesNoDia; i++) {
      const combo = combinacoes[proximo(combinacoes.length)];
      const paciente = todosPacientes[proximo(todosPacientes.length)];
      const hora = horarios[proximo(horarios.length)];

      const inicio = new Date(data);
      inicio.setHours(hora, proximo(2) === 0 ? 0 : 30, 0, 0);

      // Choque de agenda do mesmo profissional no mesmo horário
      const conflita = historicoAgendamentos.some(
        (a) =>
          a.profissionalId === combo.prof.id &&
          a.inicio.getTime() === inicio.getTime()
      );
      if (conflita) continue;

      historicoAgendamentos.push({
        pacienteId: paciente.id,
        profissionalId: combo.prof.id,
        servicoId: combo.servico.id,
        inicio,
        duracaoMin: combo.servico.duracaoMin,
        sala: `Sala ${1 + proximo(4)}`,
        // ~8% de cancelamento mantém a taxa de comparecimento realista
        status: proximo(100) < 8 ? "CANCELADO" : "CONCLUIDO",
      });
    }
  }

  await prisma.agendamento.createMany({ data: historicoAgendamentos });
  console.log(`  ${historicoAgendamentos.length} atendimentos históricos`);

  // -------------------------------------------------------------------------
  // Pacotes da Sofia
  // -------------------------------------------------------------------------
  console.log("Criando pacotes…");

  await prisma.pacote.create({
    data: {
      pacienteId: sofia.id,
      servicoId: miofascial.id,
      profissionalId: evandro.id,
      sessoesContratadas: 13,
      sessoesUtilizadas: 5,
      validade: emDias(115, 23, 59),
      status: "ATIVO",
    },
  });
  await prisma.pacote.create({
    data: {
      pacienteId: sofia.id,
      servicoId: nutricao.id,
      profissionalId: juliana.id,
      sessoesContratadas: 4,
      sessoesUtilizadas: 1,
      validade: emDias(130, 23, 59),
      status: "ATIVO",
    },
  });
  await prisma.pacote.create({
    data: {
      pacienteId: sofia.id,
      servicoId: quiropraxia.id,
      profissionalId: gustavoWeimer.id,
      sessoesContratadas: 6,
      sessoesUtilizadas: 6,
      validade: emDias(-5, 23, 59),
      status: "CONCLUIDO",
    },
  });

  // -------------------------------------------------------------------------
  // Índice de Bem-Estar — histórico + o de hoje, que o profissional vê
  // -------------------------------------------------------------------------
  console.log("Criando índices de bem-estar…");

  const historico = [
    { dias: -35, humor: 2, sono: 2, dor: 8 },
    { dias: -28, humor: 3, sono: 2, dor: 7 },
    { dias: -21, humor: 3, sono: 3, dor: 6 },
    { dias: -14, humor: 4, sono: 3, dor: 5 },
    { dias: -7, humor: 4, sono: 4, dor: 4 },
  ];
  for (const h of historico) {
    await prisma.indiceBemEstar.create({
      data: {
        pacienteId: sofia.id,
        humor: h.humor,
        sono: h.sono,
        dor: h.dor,
        respondidoEm: emDias(h.dias, 9, 0),
      },
    });
  }

  // Respondido hoje, antes da sessão das 14h — aparece no painel do Evandro
  await prisma.indiceBemEstar.create({
    data: {
      pacienteId: sofia.id,
      agendamentoId: agHoje14.id,
      humor: 4,
      sono: 3,
      dor: 7,
      observacao: "Dormi mal esta semana e o ombro direito voltou a doer mais.",
      respondidoEm: hoje(13, 40),
    },
  });


  // -------------------------------------------------------------------------
  // Biblioteca de Saúde
  // -------------------------------------------------------------------------
  console.log("Criando conteúdos…");

  await prisma.conteudo.createMany({
    data: [
      {
        titulo: "Postura correta no home office",
        resumo: "Ajustes simples na sua estação de trabalho que previnem dores lombares e cervicais.",
        corpo:
          "A altura do monitor deve deixar a borda superior da tela na linha dos olhos. Os pés precisam apoiar inteiramente no chão, com joelhos a 90 graus. Antebraços paralelos ao chão ao digitar. E o mais importante: nenhuma postura é boa por horas seguidas — levante-se a cada 50 minutos, mesmo que por um minuto.",
        tipo: "ARTIGO",
        categoria: "Postura",
      },
      {
        titulo: "Nutrição para fortalecer a imunidade",
        resumo: "Alimentos que apoiam o sistema imunológico sem modismos nem promessas milagrosas.",
        corpo:
          "Não existe alimento isolado que blinde a imunidade. O que funciona é consistência: variedade de vegetais coloridos, proteína suficiente em todas as refeições, fibras para a saúde intestinal e sono adequado. Vitamina D e zinco merecem atenção, mas suplementar só faz sentido com exame e orientação.",
        tipo: "RECEITA",
        categoria: "Nutrição",
      },
      {
        titulo: "Alongamentos guiados de 10 minutos",
        resumo: "Sequência curta para fazer pela manhã ou no intervalo do trabalho.",
        corpo:
          "A sequência trabalha cadeia posterior, cervical e quadril — as três regiões que mais sofrem com o tempo sentado. Faça cada posição por 30 segundos, sem forçar até a dor. O alongamento deve ser desconfortável, nunca doloroso.",
        tipo: "VIDEO",
        categoria: "Alongamento",
      },
      {
        titulo: "Liberação miofascial em casa",
        resumo: "Como usar rolo e bolinha com segurança entre as sessões.",
        corpo:
          "O rolo de liberação é um complemento, não um substituto da sessão. Role devagar, de 30 a 60 segundos por região, respirando. Ao encontrar um ponto sensível, pare sobre ele e respire fundo até a sensação diminuir. Evite passar diretamente sobre articulações e coluna lombar.",
        tipo: "TUTORIAL",
        categoria: "Alongamento",
      },
      {
        titulo: "Ergonomia para quem trabalha sentado",
        resumo: "O que realmente importa na cadeira, na mesa e na rotina.",
        corpo:
          "Uma cadeira cara não resolve postura ruim. Priorize apoio lombar, altura ajustável e profundidade de assento que deixe dois dedos entre o joelho e a borda. Mas a variável mais importante continua sendo o movimento: alterne posições ao longo do dia.",
        tipo: "ARTIGO",
        categoria: "Postura",
      },
      {
        titulo: "Respiração e relaxamento antes de dormir",
        resumo: "Um protocolo de cinco minutos para desacelerar o sistema nervoso.",
        corpo:
          "A respiração diafragmática ativa o sistema parassimpático e prepara o corpo para o sono. Inspire pelo nariz contando até quatro, segure por quatro, expire pela boca contando até seis. Repita por cinco minutos, de preferência com as luzes baixas e sem telas.",
        tipo: "VIDEO",
        categoria: "Vídeos",
      },
      {
        titulo: "Hidratação e desempenho físico",
        resumo: "Quanto beber e por que a sede já é sinal de atraso.",
        corpo:
          "Uma perda de apenas 2% do peso corporal em água já reduz desempenho e aumenta a percepção de esforço. Para treinos de até uma hora, água costuma bastar. Acima disso, ou em muito calor, repor eletrólitos faz diferença real na recuperação.",
        tipo: "ARTIGO",
        categoria: "Nutrição",
      },
      {
        titulo: "Alongamentos para dor lombar",
        resumo: "Movimentos seguros para aliviar a região lombar no fim do dia.",
        corpo:
          "Comece deitado, joelhos flexionados, e traga um joelho de cada vez em direção ao peito por 30 segundos. Em seguida, a posição da criança por um minuto. Se a dor irradiar para a perna, interrompa e converse com seu profissional antes de continuar.",
        tipo: "TUTORIAL",
        categoria: "Alongamento",
      },
    ],
  });

  // -------------------------------------------------------------------------
  // Solicitações aguardando a recepção
  // -------------------------------------------------------------------------
  console.log("Criando pedidos de agendamento…");

  await prisma.pedidoAgendamento.create({
    data: {
      pacienteId: rafael.id,
      servicoId: miofascial.id,
      profissionalId: evandro.id,
      periodo: "TARDE",
      diasPreferidos: "TER|QUI",
      observacao: "Volto a competir em outubro, queria intensificar antes disso.",
      criadoEm: emDias(-1, 19, 12),
    },
  });
  await prisma.pedidoAgendamento.create({
    data: {
      pacienteId: camila.id,
      servicoId: acupuntura.id,
      periodo: "MANHA",
      observacao: "Tenho enxaqueca com frequência.",
      criadoEm: hoje(8, 5),
    },
  });
  await prisma.pedidoAgendamento.create({
    data: {
      pacienteId: larissa.id,
      servicoId: nutricao.id,
      profissionalId: juliana.id,
      periodo: "QUALQUER",
      criadoEm: hoje(10, 40),
    },
  });

  // -------------------------------------------------------------------------
  // Indicações e FAQ
  // -------------------------------------------------------------------------
  console.log("Criando indicações e FAQ…");

  await prisma.indicacao.createMany({
    data: [
      { pacienteId: sofia.id, nome: "Camila R.", status: "CONFIRMADA" },
      { pacienteId: sofia.id, nome: "Beatriz L.", status: "CONFIRMADA" },
      { pacienteId: sofia.id, nome: "Renata M.", status: "PENDENTE" },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        ordem: 1,
        pergunta: "Como funciona o agendamento?",
        resposta:
          "Você agenda direto pelo app, na aba Agendamentos, escolhendo o serviço, o profissional e o horário disponível. A confirmação chega na hora.",
      },
      {
        ordem: 2,
        pergunta: "Preciso de encaminhamento médico?",
        resposta:
          "Não é obrigatório. A avaliação inicial da nossa equipe define o plano de tratamento mais indicado para o seu caso.",
      },
      {
        ordem: 3,
        pergunta: "Como funciona o Clube de Benefícios?",
        resposta:
          "A cada sessão realizada você acumula pontos e cashback. Indicações confirmadas geram R$50 de crédito, e no mês do seu aniversário há uma sessão cortesia.",
      },
      {
        ordem: 4,
        pergunta: "Posso reagendar minha sessão?",
        resposta:
          "Sim, pela aba Agendamentos, com até 24 horas de antecedência e sem custo adicional.",
      },
      {
        ordem: 5,
        pergunta: "O que é o Índice de Bem-Estar?",
        resposta:
          "É um questionário rápido sobre humor, sono e dor que você responde antes da consulta. Seu profissional recebe as respostas antes de você entrar na sala e ajusta o atendimento a partir delas.",
      },
    ],
  });

  console.log("\nSeed concluído.");
  console.log("  Paciente:      sofia@exemplo.com / vitapraxis");
  console.log("  Administração: admin@vitapraxis.com.br / vitapraxis");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
