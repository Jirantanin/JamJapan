import getPrisma from '../utils/prisma'

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
