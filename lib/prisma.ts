import "server-only"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/src/generated/prisma/client"

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured before using the database.")
  }

  globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL),
  })

  return globalForPrisma.prisma
}
