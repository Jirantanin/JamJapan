import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'
import { getSiteConfigNumber } from '../../utils/site-config'
import { handleApiError } from '../../utils/error-handler'

defineRouteMeta({
  openAPI: {
    tags: ['routes'],
    summary: 'List routes',
    description: 'Get paginated list of routes with optional filters',
    parameters: [
      { in: 'query', name: 'city', schema: { type: 'string' } },
      { in: 'query', name: 'difficulty', schema: { type: 'string', enum: ['easy', 'medium', 'hard'] } },
      { in: 'query', name: 'source', schema: { type: 'string', enum: ['official', 'community'] } },
      { in: 'query', name: 'q', schema: { type: 'string' } },
      { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
      { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } },
    ],
  },
})

export default defineEventHandler(async (event) => {
  try {
    const prisma = await getPrisma()
    const query = getQuery(event)

    // Get current user session for isSaved calculation
    const session = await getUserSession(event).catch(() => null)
    const currentUserId = (session?.user as any)?.id

    const city = query.city as string | undefined
    const difficulty = query.difficulty as string | undefined
    const q = query.q as string | undefined
    const defaultLimit = await getSiteConfigNumber('pagination.defaultLimit', 12)
    const maxLimit = await getSiteConfigNumber('pagination.maxLimit', 50)
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit as string) || defaultLimit))
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
        include: {
          steps: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
          savedBy: true, // ✅ Fetch savedBy relationship for isSaved calculation
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.route.count({ where }),
    ])

    return {
      routes: routes.map(r => transformRoute(r, currentUserId)), // ✅ Pass currentUserId for isSaved calculation
      total,
      page,
      limit,
    }
  } catch (error) {
    handleApiError(error)
  }
})
