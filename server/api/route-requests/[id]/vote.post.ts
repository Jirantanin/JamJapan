import getPrisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const prisma = await getPrisma()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
  }

  const request = await prisma.routeRequest.findUnique({ where: { id } })
  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'Route request not found' })
  }

  // Can't vote on own request
  if (request.createdById === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot vote on your own request' })
  }

  // Check if already voted
  const existingVote = await prisma.vote.findUnique({
    where: {
      routeRequestId_userId: {
        routeRequestId: id,
        userId: user.id,
      },
    },
  })

  if (existingVote) {
    // Remove vote
    await prisma.$transaction([
      prisma.vote.delete({ where: { id: existingVote.id } }),
      prisma.routeRequest.update({
        where: { id },
        data: { voteCount: { decrement: 1 } },
      }),
    ])
    return { voted: false, voteCount: request.voteCount - 1 }
  } else {
    // Add vote
    await prisma.$transaction([
      prisma.vote.create({
        data: { routeRequestId: id, userId: user.id },
      }),
      prisma.routeRequest.update({
        where: { id },
        data: { voteCount: { increment: 1 } },
      }),
    ])
    return { voted: true, voteCount: request.voteCount + 1 }
  }
})
