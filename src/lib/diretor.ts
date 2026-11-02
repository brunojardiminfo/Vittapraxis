/**
 * Dados do Dr. Kleber Fontolan, dono e diretor clínico.
 *
 * Ficam aqui, e não no banco, porque são conteúdo editorial do site — a tabela
 * Profissional guarda o que é operacional (nome, especialidade, foto do card).
 * Assim a página dedicada evolui sem exigir migration a cada texto novo.
 *
 * Fonte: PORTFÓLIO_VITAPRAXIS_2026.pdf, página 6. Os erros de digitação do
 * material original ("Quiiropraxia", "Héria de disco", "Guns N° Roses") foram
 * corrigidos aqui — não faz sentido reproduzi-los no site.
 */
export const DIRETOR = {
  nome: "Kleber Fontolan",
  primeiroNome: "Kleber",
  titulo: "Bacharel em Quiropraxia",
  registro: "ABQ-144",
  credencial: "20 anos de experiência",
  especialidade:
    "Especialista em coluna vertebral e sistema músculo esquelético",
  lema: "Mais saúde, mais movimento, mais qualidade de vida.",

  fotos: {
    /** Retrato de terno — abertura da página dedicada */
    retrato: "/equipe/kleber-fontolan-retrato.webp",
    /** Jaleco com modelo de coluna — reforça a autoridade técnica */
    clinico: "/equipe/kleber-fontolan-coluna.webp",
    /** Recorte quadrado para avatares e cards */
    avatar: "/equipe/kleber-fontolan.webp",
  },

  resumo:
    "Fundador da Vitapraxis, o Dr. Kleber Fontolan construiu ao longo de duas décadas uma prática centrada em avaliação funcional detalhada e planos terapêuticos individualizados. Sua abordagem une técnica de precisão a um olhar atento para a história de cada paciente.",

  /** Credenciais verificáveis, na ordem em que aparecem no portfólio */
  credenciais: [
    {
      icone: "coluna",
      texto: "Especialista em coluna vertebral e sistema músculo esquelético",
    },
    { icone: "formacao", texto: "Bacharel em Quiropraxia" },
    {
      icone: "associacao",
      texto:
        "Vice-presidente da Associação Brasileira de Quiropraxia Esportiva",
    },
    { icone: "pacientes", texto: "Mais de 25 mil pacientes atendidos" },
  ],

  /**
   * Nomes públicos que a clínica já divulga no próprio material impresso.
   *
   * Atletas primeiro: é o que a direção quer destacar, e os artistas entram
   * como complemento — foi o ajuste que a equipe pediu na revisão.
   */
  atendidos: {
    chamada: "Experiência com atletas e artistas de destaque, entre eles:",
    nomes: [
      "Luiz Suárez",
      "Martin Braithwaite",
      "William Borges",
      "Lucas Leiva",
      "Paul McCartney",
      "Guns N' Roses",
    ],
  },

  tratamentos: [
    {
      nome: "Dor lombar",
      texto: "Alívio da dor e correção da causa mecânica que a mantém.",
    },
    {
      nome: "Cervicalgia",
      texto: "Tensão e rigidez no pescoço, comuns em quem trabalha sentado.",
    },
    {
      nome: "Hérnia de disco",
      texto: "Conduta conservadora para reduzir compressão e recuperar função.",
    },
    {
      nome: "Escoliose",
      texto:
        "Acompanhamento do desvio da coluna e cuidado para amenizar o impacto na saúde e controlar os sintomas.",
    },
    {
      nome: "Enxaqueca",
      texto: "Abordagem da origem cervical que dispara boa parte das crises.",
    },
    {
      nome: "Dor ciática",
      texto: "Tratamento da irradiação para glúteo e perna.",
    },
    {
      nome: "Mobilidade",
      texto:
        "Recuperação da amplitude de movimento perdida com o passar dos anos e também com os travamentos articulares.",
    },
    {
      nome: "Postura",
      texto: "Reeducação postural para sustentar o resultado no dia a dia.",
    },
    {
      nome: "Pediátrico",
      texto: "Cuidado adaptado para crianças, com técnica suave.",
    },
    {
      nome: "Esportivo",
      texto: "Desempenho e prevenção de lesão para quem treina e compete.",
    },
  ],

  /** O que sustenta a confiança: números verificáveis */
  marcos: [
    { valor: "20", rotulo: "anos de experiência" },
    { valor: "+25 mil", rotulo: "pacientes atendidos" },
    { valor: "10", rotulo: "áreas de tratamento" },
  ],
} as const;
