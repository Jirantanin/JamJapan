import getPrisma from '../../utils/prisma'
import { transformRoute } from '../../utils/transform'

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma()

  // Check auth
  const session = await getUserSession(event)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin access required',
    })
  }

  const body = await readBody(event)

  // Validate required fields
  const required = ['id', 'title', 'description', 'city', 'difficulty', 'estimatedMinutes', 'distanceMeters', 'start', 'end', 'steps']
  for (const field of required) {
    if (!body[field]) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required field: ${field}`,
      })
    }
  }

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
      tags: JSON.stringify(body.tags || []),
      createdById: (session.user as any).id,
      steps: {
        create: body.steps.map((step: any) => ({
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
