import Link from "next/link";
import { FormularioNovoPaciente } from "./formulario";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo Paciente" };

export default function NovoPacientePage() {
  return (
    <>
      <nav className="mb-5">
        <Link
          href="/admin/pacientes"
          className="text-[0.84rem] font-semibold text-accent hover:underline"
        >
          ← Pacientes
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-[1.7rem]">Novo Paciente</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Cria o acesso ao portal e o código de indicação do Clube. Só a
          clínica cadastra: o site não tem cadastro aberto.
        </p>
      </header>

      <div className="max-w-3xl">
        <FormularioNovoPaciente />
      </div>
    </>
  );
}
