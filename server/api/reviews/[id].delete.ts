import getPrisma from '../../utils/prisma'
import { requireOwnerOrAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const reviewId = getRouterParam(event, 'id')

  const prisma = await getPrisma()

  // Check review exists
  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  }

  // Require owner or admin
  await requireOwnerOrAdmin(event, review.userId)

  const routeId = review.routeId

  // Delete review + recalculate averageRating and reviewCount in transaction
  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } })

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
  })

  return { success: true }
})
