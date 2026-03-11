import getPrisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const routeId = getRouterParam(event, 'id')

  if (!routeId) {
    throw createError({ statusCode: 400, statusMessage: 'Route ID is required' })
  }

  const prisma = await getPrisma()

  const route = await prisma.route.findUnique({ where: { id: routeId } })
  if (!route) {
    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  }

  const existing = await prisma.savedRoute.findUnique({
    where: { routeId_userId: { routeId, userId: user.id } },
  })

  if (existing) {
    await prisma.savedRoute.delete({ where: { id: existing.id } })
    return { saved: false }
  } else {
    await prisma.savedRoute.create({ data: { routeId, userId: user.id } })
    return { saved: true }
  }
})
