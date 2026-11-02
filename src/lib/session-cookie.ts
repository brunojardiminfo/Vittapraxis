/**
 * Isolado do resto de auth.ts de propósito: o middleware roda no Edge e
 * importar auth.ts arrastaria o Prisma junto, que não roda nesse runtime.
 */
export const SESSION_COOKIE = "vp_session";
