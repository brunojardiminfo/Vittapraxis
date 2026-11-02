import type { ReactNode } from "react";

/** Traço fino e cantos arredondados — o mesmo peso visual do símbolo da marca. */
function Svg({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const IconeInicio = (p: P) => (
  <Svg {...p}>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Svg>
);

export const IconeAgenda = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </Svg>
);

export const IconeServicos = (p: P) => (
  <Svg {...p}>
    <path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M9 9h6M9 13h6M9 17h4" />
  </Svg>
);

export const IconeEquipe = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 20c0-3 3-5 7-5s7 2 7 5" />
    <circle cx="17" cy="8" r="2.4" />
    <path d="M16 12.8c2.4.4 4 2 4 4.2" />
  </Svg>
);

export const IconeEvolucao = (p: P) => (
  <Svg {...p}>
    <path d="M4 19V9M11 19V4M18 19v-7" />
  </Svg>
);

export const IconeBemEstar = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const IconeBiblioteca = (p: P) => (
  <Svg {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h9l5 5v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z" />
    <path d="M8 12h8M8 16h5" />
  </Svg>
);

export const IconePresente = (p: P) => (
  <Svg {...p}>
    <path d="M20 7h-3.6a2.4 2.4 0 1 0-2.4 2.4H20zM4 7h3.6a2.4 2.4 0 1 1 2.4 2.4H4z" />
    <rect x="4" y="9.4" width="16" height="4" />
    <path d="M5 13.4V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5.6M12 9.4V20" />
  </Svg>
);

export const IconeCartao = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
  </Svg>
);

export const IconePerfil = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);

export const IconeAjuda = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.4 1-1.4 2.1M12 17h.01" />
  </Svg>
);

export const IconeSino = (p: P) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const IconeSair = (p: P) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export const IconeMoeda = (p: P) => (
  <Svg {...p}>
    <path d="M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" />
  </Svg>
);

export const IconeEstrela = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
  </Svg>
);

export const IconeRelogio = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </Svg>
);

export const IconeLocal = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-7-5.7-7-11a7 7 0 0 1 14 0c0 5.3-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);

export const IconeTelefone = (p: P) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .3 2 .5 3 .7a2 2 0 0 1 1.7 2z" />
  </Svg>
);

export const IconeChat = (p: P) => (
  <Svg {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

export const IconeCadeado = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconeCheck = (p: P) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

/* --- Credenciais da direção clínica --- */

export const IconeColuna = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v18" />
    <path d="M9 5h6M9 8.5h6M9 12h6M9 15.5h6M9 19h6" />
  </Svg>
);

export const IconeFormacao = (p: P) => (
  <Svg {...p}>
    <path d="M12 4 2 9l10 5 10-5-10-5z" />
    <path d="M6 11.5V17c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-5.5" />
  </Svg>
);

export const IconeAssociacao = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 20c0-3 3-5 7-5s7 2 7 5" />
    <circle cx="17.5" cy="8" r="2.2" />
    <path d="M16.5 12.8c2.4.4 4 2 4 4.2" />
  </Svg>
);

export const IconePacientes = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);

export const IconeEstrelaCheia = (p: P) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={p.className ?? "h-4 w-4"}
    aria-hidden
  >
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
  </svg>
);

export const IconeInstagram = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </Svg>
);

export const IconeQr = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
  </Svg>
);
