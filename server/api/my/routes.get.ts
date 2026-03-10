import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const prisma = await getPrisma()
  const query = getQuery(event)

  const status = query.status as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 12))
  const skip = (page - 1) * limit

  const where: any = { createdById: user.id }
  if (status && status !== 'all') {
    where.status = status
  }

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: { steps: true, createdBy: { select: { id: true, name: true, avatar: true } } },
      orderBy: { updatedAt: 'desc' },
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
