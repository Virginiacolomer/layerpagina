import { PrismaClient, Prisma } from "@prisma/client";

// Un único PrismaClient por proceso. En desarrollo Next.js recarga los módulos
// en cada cambio, así que lo guardamos en globalThis para no abrir una conexión
// nueva en cada recarga (Supabase pooler tiene un límite de conexiones).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Violación de foreign key (ej: borrar algo que todavía está referenciado por
// un pedido). Lo usamos para caer en un borrado lógico en vez de romper.
export function isForeignKeyError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

// El registro a modificar/borrar no existe.
export function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

// Violación de restricción única (ej: slug o código de cupón repetido).
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
