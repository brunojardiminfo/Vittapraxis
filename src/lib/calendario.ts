import { CLINICA } from "@/lib/clinica";

/**
 * Link "adicionar à agenda" — sem OAuth, sem projeto no Google Cloud. O
 * paciente clica, o evento já vem preenchido, ele só confirma. Cópia única:
 * se a sessão for remarcada, precisa adicionar de novo.
 *
 * Optamos por isso em vez da sincronização via API porque quem escreve no
 * calendário aqui é o próprio paciente, não o Clínica Ágil — a vantagem de
 * uma sincronização automática (a clínica remarca e a agenda do paciente
 * atualiza sozinha) não existe nesse desenho.
 */

function paraUTC(data: Date) {
  return data.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function linkGoogleAgenda({
  titulo,
  inicio,
  duracaoMin,
  local,
  detalhes,
}: {
  titulo: string;
  inicio: Date;
  duracaoMin: number;
  local?: string;
  detalhes?: string;
}) {
  const fim = new Date(inicio.getTime() + duracaoMin * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates: `${paraUTC(inicio)}/${paraUTC(fim)}`,
    location: local ?? CLINICA.endereco.completo,
    details: detalhes ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Conteúdo de um arquivo .ics — cobre iPhone, Outlook e o que não for Google. */
export function conteudoIcs({
  titulo,
  inicio,
  duracaoMin,
  local,
  detalhes,
  id,
}: {
  titulo: string;
  inicio: Date;
  duracaoMin: number;
  local?: string;
  detalhes?: string;
  id: string;
}) {
  const fim = new Date(inicio.getTime() + duracaoMin * 60_000);
  const escapar = (s: string) => s.replace(/([,;])/g, "\\$1");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vitapraxis//Agenda do Paciente//PT",
    "BEGIN:VEVENT",
    `UID:${id}@vitapraxis.com.br`,
    `DTSTAMP:${paraUTC(new Date())}`,
    `DTSTART:${paraUTC(inicio)}`,
    `DTEND:${paraUTC(fim)}`,
    `SUMMARY:${escapar(titulo)}`,
    `LOCATION:${escapar(local ?? CLINICA.endereco.completo)}`,
    detalhes ? `DESCRIPTION:${escapar(detalhes)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((l): l is string => l !== null)
    .join("\r\n");
}
