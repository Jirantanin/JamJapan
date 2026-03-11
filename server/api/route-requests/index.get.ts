import getPrisma from '../../utils/prisma'
import { transformRouteRequest } from '../../utils/transform'

defineRouteMeta({
  openAPI: {
    tags: ['route-requests'],
    summary: 'List route requests',
    description: 'Get paginated list of route requests with voting info',
  },
})

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()
  const query = getQuery(event)

  const city = query.city as string | undefined
  const status = (query.status as string) || 'pending'
  const sort = (query.sort as string) || 'votes'
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 12))
  const skip = (page - 1) * limit

  const where: any = {}
  if (status && status !== 'all') {
    where.status = status
  }
  if (city && city !== 'all') {
    where.city = city
  }

  const orderBy = sort === 'newest'
    ? { createdAt: 'desc' as const }
    : { voteCount: 'desc' as const }

  // Try to get current user for hasVoted check
  const session = await getUserSession(event).catch(() => null)
  const currentUserId = (session?.user as any)?.id

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
    requests: requests.map(r => transformRouteRequest(r, currentUserId)),
    total,
    page,
    limit,
  }
})
