import getPrisma from '../utils/prisma'

defineRouteMeta({
  openAPI: {
    tags: ['cities'],
    summary: 'List cities',
    description: 'Get all cities with route counts',
  },
})

export default defineEventHandler(async () => {
  const prisma = await getPrisma()

  const cityCounts = await prisma.route.groupBy({
    by: ['city'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  return cityCounts.map(c => ({
    city: c.city,
    count: c._count.id,
  }))
})
