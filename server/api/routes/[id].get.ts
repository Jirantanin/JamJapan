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
    include: { steps: true },
  })

  if (!route) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Route not found',
    })
  }

  return transformRoute(route)
})
