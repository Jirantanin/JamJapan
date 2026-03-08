import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'
import { createRouteSchema } from '../../utils/validate'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const prisma = await getPrisma()

  const result = createRouteSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', '),
    })
  }
  const body = result.data

  // Check if route already exists
  const existing = await prisma.route.findUnique({ where: { id: body.id } })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Route with this ID already exists',
    })
  }

  const route = await prisma.route.create({
    data: {
      id: body.id,
      title: body.title,
      description: body.description,
      city: body.city,
      difficulty: body.difficulty,
      estimatedMinutes: body.estimatedMinutes,
      distanceMeters: body.distanceMeters,
      coverImage: body.coverImage || null,
      startLat: body.start.lat,
      startLng: body.start.lng,
      startName: body.start.name || null,
      endLat: body.end.lat,
      endLng: body.end.lng,
      endName: body.end.name || null,
      tags: JSON.stringify(body.tags),
      createdById: user.id,
      steps: {
        create: body.steps.map(step => ({
          order: step.order,
          instruction: step.instruction,
          image: step.image || null,
          locationLat: step.location.lat,
          locationLng: step.location.lng,
          locationName: step.location.name || null,
          distanceFromPrev: step.distanceFromPrev || null,
          note: step.note || null,
        })),
      },
    },
    include: { steps: true },
  })

  return transformRoute(route)
})
