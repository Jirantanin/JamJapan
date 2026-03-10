import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'
import { updateRouteSchema } from '../../utils/validate'
import { requireOwnerOrAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
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

  const user = await requireOwnerOrAdmin(event, existing.createdById)

  const result = updateRouteSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', '),
    })
  }
  const body = result.data

  // Update route
  const route = await prisma.route.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.city && { city: body.city }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.estimatedMinutes && { estimatedMinutes: body.estimatedMinutes }),
      ...(body.distanceMeters && { distanceMeters: body.distanceMeters }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      ...(body.start && {
        startLat: body.start.lat,
        startLng: body.start.lng,
        startName: body.start.name || null,
      }),
      ...(body.end && {
        endLat: body.end.lat,
        endLng: body.end.lng,
        endName: body.end.name || null,
      }),
      ...(body.tags && { tags: JSON.stringify(body.tags) }),
    },
    include: { steps: true, createdBy: { select: { id: true, name: true, avatar: true } } },
  })

  // Update steps if provided (replace all)
  if (body.steps) {
    await prisma.step.deleteMany({ where: { routeId: id } })
    await prisma.step.createMany({
      data: body.steps.map(step => ({
        order: step.order,
        instruction: step.instruction,
        image: step.image || null,
        locationLat: step.location.lat,
        locationLng: step.location.lng,
        locationName: step.location.name || null,
        distanceFromPrev: step.distanceFromPrev || null,
        note: step.note || null,
        routeId: id,
      })),
    })

    // Re-fetch with updated steps
    const updated = await prisma.route.findUnique({
      where: { id },
      include: { steps: true, createdBy: { select: { id: true, name: true, avatar: true } } },
    })
    return transformRoute(updated!)
  }

  return transformRoute(route)
})
