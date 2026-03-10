import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Route ID is required',
    })
  }

  const route = await prisma.route.findUnique({
    where: { id },
    include: { steps: true, createdBy: { select: { id: true, name: true, avatar: true } } },
  })

  if (!route) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Route not found',
    })
  }

  // Visibility check: non-published routes only visible to owner or admin
  if (route.status !== 'published') {
    const session = await getUserSession(event).catch(() => null)
    const userId = (session?.user as any)?.id
    const userRole = (session?.user as any)?.role

    if (!userId || (userId !== route.createdById && userRole !== 'ADMIN')) {
      throw createError({ statusCode: 404, statusMessage: 'Route not found' })
    }
  }

  return transformRoute(route)
})
