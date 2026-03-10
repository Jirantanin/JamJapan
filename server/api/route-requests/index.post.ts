import getPrisma from '../../utils/prisma'
import { transformRouteRequest } from '../../utils/transform'
import { createRouteRequestSchema } from '../../utils/validate'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const prisma = await getPrisma()

  const result = createRouteRequestSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', '),
    })
  }
  const body = result.data

  const request = await prisma.routeRequest.create({
    data: {
      title: body.title,
      description: body.description,
      city: body.city,
      startPoint: body.startPoint,
      endPoint: body.endPoint,
      createdById: user.id,
    },
    include: {
      votes: true,
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  })

  return transformRouteRequest(request, user.id)
})
