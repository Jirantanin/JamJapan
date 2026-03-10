import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()
  const query = getQuery(event)

  const city = query.city as string | undefined
  const difficulty = query.difficulty as string | undefined
  const q = query.q as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 12))
  const skip = (page - 1) * limit

  const source = query.source as string | undefined

  // Build where clause
  const where: any = {
    status: 'published', // Only show published routes to public
  }

  if (city && city !== 'all') {
    where.city = city
  }

  if (difficulty && difficulty !== 'all') {
    where.difficulty = difficulty
  }

  if (source && source !== 'all') {
    where.source = source
  }

  if (q) {
    // ใช้ contains แทน mode: 'insensitive' เพื่อรองรับทั้ง SQLite + PostgreSQL
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } }, // tags เป็น JSON string — ค้นหาด้วย substring
      { startName: { contains: q } },
      { endName: { contains: q } },
      { city: { contains: q } },
    ]
  }

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: { steps: true, createdBy: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.route.count({ where }),
  ])

  return {
    routes: routes.map(transformRoute),
    total,
    page,
    limit,
  }
})
