import getPrisma from '../../../utils/prisma'
import { transformReview } from '../../../utils/transform'
import { createReviewSchema } from '../../../utils/validate'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const routeId = getRouterParam(event, 'id')

  const result = createReviewSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message,
    })
  }
  const body = result.data

  const prisma = await getPrisma()

  // Check route exists
  const route = await prisma.route.findUnique({ where: { id: routeId } })
  if (!route) {
    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  }

  // Check user hasn't already reviewed
  const existing = await prisma.review.findUnique({
    where: { routeId_userId: { routeId: routeId!, userId: user.id } },
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Already reviewed this route' })
  }

  // Create review + recalculate averageRating and reviewCount in transaction
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        rating: body.rating,
        comment: body.comment ?? null,
        routeId: routeId!,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    const stats = await tx.review.aggregate({
      where: { routeId: routeId! },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.route.update({
      where: { id: routeId! },
      data: {
        averageRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    })

    return created
  })

  return transformReview(review)
})
