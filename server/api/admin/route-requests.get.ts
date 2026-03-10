import { requireAdmin } from '../../utils/auth'
import { getPrisma } from '../../utils/prisma'
import { transformRouteRequest } from '../../utils/transform'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const prisma = await getPrisma()
  const query = getQuery(event)

  const status = (query.status as string) || 'all'
  const sort = (query.sort as string) || 'votes'
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 20))
  const skip = (page - 1) * limit

  const where: any = {}
  if (status && status !== 'all') {
    where.status = status
  }

  const orderBy = sort === 'newest'
    ? { createdAt: 'desc' as const }
    : { voteCount: 'desc' as const }

  const [requests, total] = await Promise.all([
    prisma.routeRequest.findMany({
      where,
      include: {
        votes: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.routeRequest.count({ where }),
  ])

  return {
    requests: requests.map(r => transformRouteRequest(r, user.id)),
    total,
    page,
    limit,
  }
})
