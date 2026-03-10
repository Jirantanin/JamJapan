import { requireAdmin } from '../../../../utils/auth'
import { getPrisma } from '../../../../utils/prisma'
import { transformRouteRequest } from '../../../../utils/transform'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const prisma = await getPrisma()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
  }

  const body = await readBody(event)
  const status = body?.status as string

  if (!['pending', 'fulfilled', 'closed'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const existing = await prisma.routeRequest.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Route request not found' })
  }

  const updated = await prisma.routeRequest.update({
    where: { id },
    data: {
      status,
      ...(body.fulfilledRouteId ? { fulfilledRouteId: body.fulfilledRouteId } : {}),
    },
    include: {
      votes: true,
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  })

  return transformRouteRequest(updated, user.id)
})
