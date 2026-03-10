import getPrisma from '../../utils/prisma'
import { transformRouteRequest } from '../../utils/transform'
import { updateRouteRequestSchema } from '../../utils/validate'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const prisma = await getPrisma()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
  }

  const existing = await prisma.routeRequest.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Route request not found' })
  }

  // Only owner can edit, and only pending requests
  if (user.id !== existing.createdById && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only edit your own requests' })
  }
  if (existing.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Can only edit pending requests' })
  }

  const result = updateRouteRequestSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', '),
    })
  }
  const body = result.data

  const updated = await prisma.routeRequest.update({
    where: { id },
    data: body,
    include: {
      votes: true,
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  })

  return transformRouteRequest(updated, user.id)
})
