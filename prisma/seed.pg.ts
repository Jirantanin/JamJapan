/**
 * Production seed script for PostgreSQL.
 * Run via: DATABASE_URL=... npx tsx prisma/seed.pg.ts
 */
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const _dirname = dirname(fileURLToPath(import.meta.url))

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

interface RouteJson {
  id: string
  title: string
  description: string
  city: string
  difficulty: string
  estimatedMinutes: number
  distanceMeters: number
  coverImage: string
  start: { lat: number; lng: number; name?: string }
  end: { lat: number; lng: number; name?: string }
  steps: {
    order: number
    instruction: string
    image?: string
    location: { lat: number; lng: number; name?: string }
    distanceFromPrev?: number
    note?: string
  }[]
  tags: string[]
}

async function main() {
  console.log('Seeding database (PostgreSQL)...')

  const dataPath = resolve(_dirname, '../data/routes.json')
  const routesData: RouteJson[] = JSON.parse(readFileSync(dataPath, 'utf-8'))

  for (const route of routesData) {
    await prisma.route.deleteMany({ where: { id: route.id } })
    await prisma.route.create({
      data: {
        id: route.id,
        title: route.title,
        description: route.description,
        city: route.city,
        difficulty: route.difficulty,
        estimatedMinutes: route.estimatedMinutes,
        distanceMeters: route.distanceMeters,
        coverImage: route.coverImage,
        startLat: route.start.lat,
        startLng: route.start.lng,
        startName: route.start.name || null,
        endLat: route.end.lat,
        endLng: route.end.lng,
        endName: route.end.name || null,
        tags: JSON.stringify(route.tags),
        steps: {
          create: route.steps.map(step => ({
            order: step.order,
            instruction: step.instruction,
            image: step.image || null,
            locationLat: step.location.lat,
            locationLng: step.location.lng,
            locationName: step.location.name || null,
            distanceFromPrev: step.distanceFromPrev || null,
            note: step.note || null,
          })),
        },
      },
    })
    console.log(`  Created: ${route.title}`)
  }

  console.log(`\nSeeded ${routesData.length} routes successfully!`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
