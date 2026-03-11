import getPrisma from '../../../utils/prisma'
import { transformReview } from '../../../utils/transform'

export default defineEventHandler(async (event) => {
  const routeId = getRouterParam(event, 'id')
  const query = getQuery(event)

  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10))
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit ?? '10'), 10)))
  const skip = (page - 1) * limit

  const prisma = await getPrisma()

  const route = await prisma.route.findUnique({ where: { id: routeId } })
  if (!route) {
    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { routeId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { routeId } }),
  ])

  return {
    reviews: reviews.map(transformReview),
    total,
    page,
    limit,
  }
})
