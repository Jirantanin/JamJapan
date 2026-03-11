import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'

defineRouteMeta({
  openAPI: {
    tags: ['routes'],
    summary: 'Get route by ID',
    description: 'Get a single route with steps and reviews',
  },
})

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Route ID is required',
    })
  }

  // Get current user session early for both visibility check and isSaved calculation
  const session = await getUserSession(event).catch(() => null)
  const currentUserId = (session?.user as any)?.id
  const userRole = (session?.user as any)?.role

  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      steps: true,
      createdBy: { select: { id: true, name: true, avatar: true } },
      savedBy: true, // ✅ Fetch savedBy relationship for isSaved calculation
    },
  })

  if (!route) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Route not found',
    })
  }

  // Visibility check: non-published routes only visible to owner or admin
  if (route.status !== 'published') {
    if (!currentUserId || (currentUserId !== route.createdById && userRole !== 'ADMIN')) {
      throw createError({ statusCode: 404, statusMessage: 'Route not found' })
    }
  }

  return transformRoute(route, currentUserId) // ✅ Pass currentUserId for isSaved calculation
})
