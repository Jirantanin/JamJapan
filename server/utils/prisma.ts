import { PrismaClient } from '../../generated/prisma/client'

type PrismaClientType = InstanceType<typeof PrismaClient>
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType }

async function createPrismaClient(): Promise<PrismaClientType> {
  if (process.env.NODE_ENV === 'production') {
    // Production: PostgreSQL adapter
    const { Pool } = await import('pg')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter } as any)
  } else {
    // Development: SQLite (better-sqlite3 adapter)
    const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
    const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
    return new PrismaClient({ adapter } as any)
  }
}

let prismaPromise: Promise<PrismaClientType> | null = null

export async function getPrisma(): Promise<PrismaClientType> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  if (!prismaPromise) {
    prismaPromise = createPrismaClient()
  }

  const client = await prismaPromise

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

export default getPrisma
