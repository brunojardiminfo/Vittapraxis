import type { Slide } from "@/components/hero-carrossel";

/**
 * Os quatro argumentos da abertura do site, na ordem em que convencem.
 *
 * Começa pelo ambiente, que é o que a foto mostra; passa pela direção
 * clínica, que é a credencial mais forte; abre o leque das especialidades; e
 * fecha no Clube, que é o motivo para voltar. Fica em arquivo, como o resto
 * do conteúdo editorial do site — a tabela Servico continua dona do que é
 * operacional.
 */
export const SLIDES_HOME: Slide[] = [
  {
    etiqueta: "Bem-vindo à Vitapraxis",
    titulo:
      "Um ambiente projetado para cuidar da sua saúde e bem-estar.",
    texto:
      "Cada paciente possui uma história única. Por isso nossos tratamentos são planejados de forma individualizada, unindo profissionais especializados, atendimento humanizado e técnicas baseadas em evidências.",
    imagem: "/clinica/recepcao.webp",
    alt: "Recepção da Vitapraxis, com parede de vegetação natural e balcão de mármore",
    acao: { href: "/contato", texto: "Agende sua Avaliação" },
  },
  {
    etiqueta: "Direção clínica",
    titulo: "Vinte anos cuidando de quem depende do próprio corpo.",
    texto:
      "Dr. Kleber Fontolan, bacharel em Quiropraxia e vice-presidente da Associação Brasileira de Quiropraxia Esportiva, atendeu Luiz Suárez e muitos outros atletas — e também alguns artistas globais.",
    imagem: "/clinica/consultorio.webp",
    alt: "Consultório da Vitapraxis com parede de certificações",
    acao: { href: "/kleber-fontolan", texto: "Conheça a trajetória" },
    marcos: [
      { valor: "20", rotulo: "anos de experiência" },
      { valor: "+25 mil", rotulo: "pacientes atendidos" },
    ],
  },
  {
    etiqueta: "Equipe multidisciplinar",
    titulo: "Sete especialidades que conversam entre si.",
    texto:
      "Quiropraxia, Massoterapia, Liberação Miofascial, Acupuntura, Nutrição, Fisioterapia ATM e Iridologia. A avaliação define o caminho, e o plano é montado com quem o seu caso pedir.",
    imagem: "/clinica/sala-vista.webp",
    alt: "Consultório da Vitapraxis com vista para a cidade",
    acao: { href: "/especialidades", texto: "Ver as especialidades" },
    marcos: [
      { valor: "11", rotulo: "especialistas" },
      { valor: "7", rotulo: "especialidades" },
    ],
  },
  {
    etiqueta: "Clube Vitapraxis",
    titulo: "Quem cuida da saúde merece ser reconhecido.",
    texto:
      "Cada sessão vira ponto, cada indicação vira crédito, e o benefício cresce conforme você segue no tratamento. Sem mensalidade e sem cadastro à parte: quem é paciente já faz parte.",
    imagem: "/clinica/sala-maca.webp",
    alt: "Sala de atendimento da Vitapraxis preparada para a sessão",
    acao: { href: "/clube", texto: "Conhecer o Clube" },
  },
];
