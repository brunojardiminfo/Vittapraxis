import { CLINICA } from "@/lib/clinica";

/**
 * Mensagem que a recepção manda no WhatsApp com o acesso recém-criado.
 *
 * A senha vai junto porque ninguém se cadastra sozinho: é a clínica que cria
 * a conta, e o WhatsApp é o canal que a pessoa já usa com ela. A senha é
 * provisória e a troca é exigida no primeiro acesso, então ela não vive além
 * daquela conversa.
 */
export function mensagemAcesso(dados: {
  nome: string;
  email: string;
  senha: string;
  papel: "PACIENTE" | "PROFISSIONAL";
}) {
  const primeiro = dados.nome.trim().split(/\s+/)[0] ?? "";
  const oQue =
    dados.papel === "PROFISSIONAL"
      ? "Seu acesso ao Portal do Profissional da Vitapraxis está pronto. Lá você encontra a ficha dos pacientes e registra a evolução de cada atendimento."
      : "Seu acesso ao portal da Vitapraxis está pronto! 🌿 Lá você acompanha suas sessões, seu saldo do Clube e seus vouchers.";

  return `Olá, ${primeiro}! ${oQue}

Acesse: ${CLINICA.site}/entrar
E-mail: ${dados.email}
Senha provisória: ${dados.senha}

No primeiro acesso o sistema pede para você criar uma senha só sua.`;
}
