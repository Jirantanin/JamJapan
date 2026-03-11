import { requireAdmin } from '../../utils/auth'
import { getPrisma } from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = await getPrisma()

  const [totalRoutes, byCity, byDifficulty, recentRoutes, totalRequests, pendingRequests] = await Promise.all([
    prisma.route.count(),
    prisma.route.groupBy({ by: ['city'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.route.groupBy({ by: ['difficulty'], _count: { id: true } }),
    prisma.route.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { steps: true },
    }),
    prisma.routeRequest.count(),
    prisma.routeRequest.count({ where: { status: 'pending' } }),
  ])

  return {
    totalRoutes,
    byCity: byCity.map(c => ({ city: c.city, count: c._count.id })),
    byDifficulty: byDifficulty.map(d => ({ difficulty: d.difficulty, count: d._count.id })),
    recentRoutes: recentRoutes.map(r => transformRoute(r)),
    totalRequests,
    pendingRequests,
  }
})
