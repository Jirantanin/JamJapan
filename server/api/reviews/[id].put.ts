import getPrisma from '../../utils/prisma'
import { transformReview } from '../../utils/transform'
import { updateReviewSchema } from '../../utils/validate'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const reviewId = getRouterParam(event, 'id')

  const result = updateReviewSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message,
    })
  }
  const body = result.data

  const prisma = await getPrisma()

  // Check review exists and belongs to user
  const existing = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  }
  if (existing.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only modify your own reviews' })
  }

  const routeId = existing.routeId

  // Update review + recalculate averageRating and reviewCount in transaction
  const review = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.comment !== undefined && { comment: body.comment }),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    const stats = await tx.review.aggregate({
      where: { routeId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.route.update({
      where: { id: routeId },
      data: {
        averageRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    })

    return updated
  })

  return transformReview(review)
})
