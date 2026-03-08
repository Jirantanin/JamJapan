import getPrisma from '../../utils/prisma'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = await getPrisma()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Route ID is required',
    })
  }

  const existing = await prisma.route.findUnique({ where: { id } })
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Route not found',
    })
  }

  // Steps will be cascade deleted
  await prisma.route.delete({ where: { id } })

  return { success: true, message: `Route "${id}" deleted` }
})
