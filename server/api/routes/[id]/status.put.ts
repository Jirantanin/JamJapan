import getPrisma from '../../../utils/prisma'
import { transformRoute } from '../../../utils/transform'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const prisma = await getPrisma()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Route ID is required' })
  }

  const body = await readBody(event)
  const status = body?.status as string

  if (!['draft', 'published', 'unpublished'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status. Must be draft, published, or unpublished' })
  }

  const route = await prisma.route.findUnique({ where: { id } })
  if (!route) {
    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  }

  // Permission check
  if (user.role !== 'ADMIN') {
    // Non-admin can only change their own route
    if (user.id !== route.createdById) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only modify your own routes' })
    }
    // Non-admin can only: draft → published (self-publish)
    if (!(route.status === 'draft' && status === 'published')) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only publish your own draft routes' })
    }
  }

  const updated = await prisma.route.update({
    where: { id },
    data: { status },
    include: { steps: true, createdBy: { select: { id: true, name: true, avatar: true } } },
  })

  return transformRoute(updated)
})
