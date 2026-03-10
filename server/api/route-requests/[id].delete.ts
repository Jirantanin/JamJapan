import getPrisma from '../../utils/prisma'
import { requireOwnerOrAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
  }

  const existing = await prisma.routeRequest.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Route request not found' })
  }

  await requireOwnerOrAdmin(event, existing.createdById)

  // Votes will be cascade deleted
  await prisma.routeRequest.delete({ where: { id } })

  return { success: true, message: 'Route request deleted' }
})
