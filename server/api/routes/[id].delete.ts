import getPrisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()

  // Check auth
  const session = await getUserSession(event)
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin access required',
    })
  }

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
