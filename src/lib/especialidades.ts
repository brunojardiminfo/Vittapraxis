/**
 * Conteúdo editorial de cada especialidade, transcrito do
 * PORTFÓLIO_VITAPRAXIS_2026.pdf (páginas 7 a 11).
 *
 * Fica fora do banco de propósito: são textos de marketing que mudam com a
 * comunicação da clínica, não dados operacionais. A tabela Servico continua
 * dona de preço, duração e quem atende.
 *
 * O campo `slug` casa com o nome do serviço no banco, para a página conseguir
 * juntar as duas fontes.
 */

export type Especialidade = {
  slug: string;
  /** Nome do serviço no banco, para cruzar preço e duração */
  servicoNome: string;
  titulo: string;
  selo?: string;
  chamada: string;
  foto: string | null;
  /** O que a especialidade entrega, item a item */
  destaques: { nome: string; texto: string }[];
  /** Lista curta de fechamento — "Benefícios" ou "Diferenciais" no impresso */
  fechamento: { titulo: string; itens: string[] };
  rodape?: string;
};

export const ESPECIALIDADES: Especialidade[] = [
  {
    slug: "quiropraxia",
    servicoNome: "Quiropraxia",
    titulo: "Quiropraxia",
    selo: "Especialidade da casa",
    chamada: "Alinhamento que devolve movimento e tira a dor do caminho.",
    foto: null,
    destaques: [
      {
        nome: "Dor lombar e cervical",
        texto: "Alívio da dor e correção da causa mecânica que a mantém.",
      },
      {
        nome: "Hérnia de disco",
        texto:
          "Conduta conservadora para reduzir compressão e recuperar função.",
      },
      {
        nome: "Escoliose",
        texto:
          "Acompanhamento do desvio da coluna e cuidado para amenizar o impacto na saúde.",
      },
      {
        nome: "Enxaqueca",
        texto: "Abordagem da origem cervical que dispara boa parte das crises.",
      },
      {
        nome: "Mobilidade",
        texto:
          "Recuperação da amplitude perdida com o passar dos anos e com os travamentos articulares.",
      },
      {
        nome: "Esportivo e pediátrico",
        texto:
          "Desempenho para quem treina e técnica suave adaptada para crianças.",
      },
    ],
    fechamento: {
      titulo: "Diferenciais",
      itens: [
        "Avaliação funcional detalhada antes do primeiro ajuste",
        "Plano terapêutico individualizado",
        "Direção clínica com 20 anos de experiência",
        "Técnicas baseadas em evidências",
        "Acompanhamento até o resultado",
      ],
    },
  },
  {
    slug: "massoterapia",
    servicoNome: "Massoterapia",
    titulo: "Massoterapia",
    selo: "Premium",
    chamada: "Bem-estar, alívio para o corpo e a mente.",
    foto: "/servicos/massoterapia.webp",
    destaques: [
      {
        nome: "Liberação miofascial",
        texto: "Alívio de tensões e dores musculares.",
      },
      {
        nome: "Massagem relaxante",
        texto: "Reduz o estresse e promove relaxamento.",
      },
      {
        nome: "Massagem terapêutica",
        texto: "Indicada para dores e disfunções musculares.",
      },
      {
        nome: "Massagem recovery",
        texto: "Auxilia na recuperação e melhora de desempenho.",
      },
      {
        nome: "Drenagem linfática",
        texto: "Estimula a circulação e reduz inchaço e retenção de líquidos.",
      },
      {
        nome: "Legacy",
        texto:
          "Tecnologia para remodelação, firmeza da pele e estímulo de colágeno.",
      },
      {
        nome: "Protocolos personalizados",
        texto: "Tratamentos sob medida para suas necessidades.",
      },
    ],
    fechamento: {
      titulo: "Diferenciais",
      itens: [
        "Técnicas especializadas e seguras",
        "Atendimento individualizado",
        "Ambiente acolhedor e exclusivo",
        "Mais saúde, leveza e qualidade de vida",
        "Resultados que transformam corpo e mente",
      ],
    },
    rodape:
      "Cuidar de você é o primeiro passo para uma vida com mais leveza e equilíbrio.",
  },
  {
    slug: "acupuntura",
    servicoNome: "Acupuntura",
    titulo: "Acupuntura",
    selo: "Premium",
    chamada: "Equilíbrio que restaura. Saúde que transforma.",
    foto: "/servicos/acupuntura.webp",
    destaques: [
      {
        nome: "Controle da dor",
        texto: "Alívio natural de dores agudas e crônicas.",
      },
      {
        nome: "Fortalece a imunidade",
        texto: "Estimula as defesas naturais do organismo.",
      },
      {
        nome: "Saúde digestiva",
        texto: "Melhora funções digestivas e reduz desconfortos.",
      },
      {
        nome: "Saúde emocional",
        texto: "Reduz estresse, ansiedade e promove bem-estar.",
      },
      {
        nome: "Regula o organismo",
        texto: "Melhora o sono, hormônios e ciclo menstrual.",
      },
      {
        nome: "Desempenho e recuperação",
        texto: "Acelera recuperação e melhora o desempenho físico.",
      },
      {
        nome: "Acupuntura pediátrica",
        texto: "Cuida da saúde das crianças de forma segura e natural.",
      },
    ],
    fechamento: {
      titulo: "Benefícios",
      itens: [
        "Método natural e seguro",
        "Atendimento individualizado",
        "Equilíbrio físico, mental e emocional",
        "Resultados que transformam corpo e mente",
        "Mais saúde, disposição e qualidade de vida",
      ],
    },
  },
  {
    slug: "nutricao",
    servicoNome: "Nutrição",
    titulo: "Nutrição",
    selo: "Premium",
    chamada: "Nutrição que transforma. Saúde que acompanha.",
    foto: "/servicos/nutricao.webp",
    destaques: [
      {
        nome: "Nutrição personalizada",
        texto: "Plano alimentar individualizado para seus objetivos e rotina.",
      },
      {
        nome: "Controle de peso",
        texto: "Estratégias eficazes para emagrecimento saudável.",
      },
      {
        nome: "Composição corporal",
        texto: "Aumento de massa magra e redução de gordura corporal.",
      },
      {
        nome: "Saúde intestinal",
        texto: "Melhora da digestão, absorção de nutrientes e bem-estar.",
      },
      {
        nome: "Imunidade e energia",
        texto: "Alimentação que fortalece o corpo e aumenta a disposição.",
      },
      {
        nome: "Nutrição integrativa",
        texto: "Abordagem completa que cuida do corpo e da mente.",
      },
    ],
    fechamento: {
      titulo: "Benefícios",
      itens: [
        "Mais saúde e qualidade de vida",
        "Resultados sustentáveis",
        "Mais energia e disposição",
        "Melhora da composição corporal",
        "Foco, concentração e bem-estar",
        "Prevenção de doenças",
        "Equilíbrio físico e emocional",
      ],
    },
  },
  {
    slug: "fisioterapia-atm",
    servicoNome: "Fisioterapia ATM",
    titulo: "Fisioterapia ATM",
    chamada: "Cuidar da sua ATM é promover qualidade de vida.",
    foto: "/servicos/fisioterapia-atm.webp",
    destaques: [
      {
        nome: "Alívio da dor",
        texto: "Reduz dores na mandíbula, cabeça, face e pescoço.",
      },
      {
        nome: "Função e mobilidade",
        texto: "Melhora os movimentos da mandíbula e a mastigação.",
      },
      {
        nome: "Tensão e bruxismo",
        texto: "Reduz a tensão muscular e os efeitos do bruxismo.",
      },
      {
        nome: "Postura e equilíbrio",
        texto: "Corrige desequilíbrios que afetam a ATM e a postura.",
      },
      {
        nome: "Relaxamento muscular",
        texto: "Técnicas que promovem relaxamento e bem-estar.",
      },
      {
        nome: "Qualidade de vida",
        texto: "Mais conforto, função e saúde para o seu dia a dia.",
      },
    ],
    fechamento: {
      titulo: "Benefícios",
      itens: [
        "Alívio da dor e da tensão",
        "Melhora da função mandibular",
        "Redução do bruxismo",
        "Melhora da postura e equilíbrio",
        "Mais bem-estar e qualidade de vida",
        "Tratamento seguro e personalizado",
      ],
    },
  },
  {
    slug: "liberacao-miofascial",
    servicoNome: "Liberação Miofascial",
    titulo: "Liberação Miofascial",
    chamada:
      "Para atletas, esportistas e apaixonados por atividade física.",
    foto: null,
    destaques: [
      {
        nome: "Melhora do desempenho",
        texto:
          "Aumenta a eficiência muscular, potencializa movimentos e a performance esportiva.",
      },
      {
        nome: "Prevenção de lesões",
        texto:
          "Reduz tensões e desequilíbrios, diminuindo o risco de contusões.",
      },
      {
        nome: "Alívio de dores",
        texto: "Libera aderências miofasciais que causam dor e rigidez.",
      },
      {
        nome: "Recuperação acelerada",
        texto: "Reduz o tempo de recuperação pós-treino e pós-competição.",
      },
      {
        nome: "Mobilidade e flexibilidade",
        texto: "Melhora a amplitude e a qualidade do movimento.",
      },
      {
        nome: "Redução de inflamações",
        texto: "Estimula a circulação e auxilia na eliminação de toxinas.",
      },
      {
        nome: "Equilíbrio corpo e mente",
        texto: "Promove relaxamento profundo e melhora o foco.",
      },
    ],
    fechamento: {
      titulo: "Diferenciais",
      itens: [
        "Atendimento individual",
        "Abordagem segura e eficaz, feita sob medida",
        "Sessões de 1h, 1h30 e 2h",
      ],
    },
    rodape: "Corpo livre, mente forte, performance elevada.",
  },
  {
    slug: "iridologia",
    servicoNome: "Iridologia",
    titulo: "Iridologia",
    chamada: "Uma leitura a mais para enxergar o conjunto.",
    foto: null,
    destaques: [
      {
        nome: "Avaliação complementar",
        texto:
          "Análise da íris como mais uma camada de informação, somada ao exame clínico.",
      },
      {
        nome: "Visão integrada da saúde",
        texto:
          "Observa o corpo como um todo, em vez de tratar cada queixa isolada.",
      },
      {
        nome: "Apoio ao plano terapêutico",
        texto:
          "Orienta as escolhas do time multidisciplinar na montagem do tratamento.",
      },
    ],
    fechamento: {
      titulo: "Como funciona",
      itens: [
        "Conversa inicial sobre histórico e queixas",
        "Análise da íris em consultório",
        "Devolutiva junto ao plano de tratamento",
        "Encaminhamento para as especialidades indicadas",
      ],
    },
    rodape:
      "Complementa a avaliação clínica — não substitui diagnóstico médico.",
  },
];
