import { PrismaClient } from "@prisma/client";

// Em dev o hot reload recria módulos a cada edição; sem o cache global isso
// abriria uma conexão nova a cada vez até estourar o limite do SQLite.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
