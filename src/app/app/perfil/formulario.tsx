"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { atualizarPerfil, type EstadoPerfil } from "@/app/actions/perfil";
import { IconeCheck } from "@/components/icones";

export type DadosPerfil = {
  telefone: string;
  whatsapp: string;
  endereco: string;
  emergenciaNome: string;
  emergenciaVinculo: string;
  emergenciaFone: string;
};

const CAMPO =
  "w-full rounded-xl border border-line bg-sunken px-4 py-2.5 text-[0.92rem] text-ink outline-none transition-colors focus:border-accent";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-vp-green px-7 py-3 text-sm font-semibold text-[var(--on-brand)] transition-colors hover:bg-vp-gold-deep disabled:opacity-60 dark:bg-vp-gold dark:text-vp-green-deep"
    >
      {pending ? "Salvando…" : "Salvar alterações"}
    </button>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  onChange,
  tipo = "text",
  placeholder,
  largo = false,
}: {
  id: keyof DadosPerfil;
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  tipo?: string;
  placeholder?: string;
  largo?: boolean;
}) {
  return (
    <div className={largo ? "sm:col-span-2" : undefined}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-muted"
      >
        {rotulo}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={CAMPO}
      />
    </div>
  );
}

export function FormularioPerfil({ inicial }: { inicial: DadosPerfil }) {
  const [estado, formAction] = useActionState<EstadoPerfil, FormData>(
    atualizarPerfil,
    {}
  );

  // Controlados: o React 19 limpa campos não-controlados depois da action, e
  // um erro de validação apagaria tudo que a pessoa digitou.
  const [dados, setDados] = useState<DadosPerfil>(inicial);
  const set = (campo: keyof DadosPerfil) => (v: string) =>
    setDados((d) => ({ ...d, [campo]: v }));

  return (
    <form action={formAction}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="telefone"
          rotulo="Telefone"
          valor={dados.telefone}
          onChange={set("telefone")}
          tipo="tel"
          placeholder="(51) 3000-0000"
        />
        <Campo
          id="whatsapp"
          rotulo="WhatsApp"
          valor={dados.whatsapp}
          onChange={set("whatsapp")}
          tipo="tel"
          placeholder="(51) 90000-0000"
        />
        <Campo
          id="endereco"
          rotulo="Endereço"
          valor={dados.endereco}
          onChange={set("endereco")}
          largo
        />
      </div>

      <h3 className="mb-4 mt-8 text-[1.05rem]">Contato de emergência</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="emergenciaNome"
          rotulo="Nome"
          valor={dados.emergenciaNome}
          onChange={set("emergenciaNome")}
        />
        <Campo
          id="emergenciaVinculo"
          rotulo="Parentesco"
          valor={dados.emergenciaVinculo}
          onChange={set("emergenciaVinculo")}
          placeholder="Cônjuge, mãe, irmão…"
        />
        <Campo
          id="emergenciaFone"
          rotulo="Telefone"
          valor={dados.emergenciaFone}
          onChange={set("emergenciaFone")}
          tipo="tel"
          largo
        />
      </div>

      {estado.erro ? (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      {estado.ok ? (
        <p className="mt-5 flex items-center gap-2.5 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success">
          <IconeCheck className="h-4 w-4 shrink-0" />
          Dados atualizados.
        </p>
      ) : null}

      <div className="mt-7">
        <Salvar />
      </div>
    </form>
  );
}
