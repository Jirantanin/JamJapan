import getPrisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'
import { transformRoute } from '../../utils/transform'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const prisma = await getPrisma()
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 12))
  const skip = (page - 1) * limit

  const [savedRoutes, total] = await Promise.all([
    prisma.savedRoute.findMany({
      where: { userId: user.id },
      include: {
        route: {
          include: {
            steps: true,
            createdBy: { select: { id: true, name: true, avatar: true } },
            savedBy: { where: { userId: user.id }, select: { userId: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.savedRoute.count({ where: { userId: user.id } }),
  ])

  return {
    routes: savedRoutes.map(sr => transformRoute(sr.route, user.id)),
    total,
    page,
    limit,
  }
})
