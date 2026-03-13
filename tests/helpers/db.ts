/**
 * Test DB helper — creates/cleans test data with FK-aware ordering.
 * Each test file uses a unique PREFIX to avoid cross-contamination.
 */

import getPrisma from '../../server/utils/prisma'

/**
 * Create a test user in the database.
 */
export async function createTestUser(
  id: string,
  role: 'USER' | 'ADMIN' = 'USER'
) {
  const prisma = await getPrisma()
  return prisma.user.upsert({
    where: { id },
    update: { role },
    create: {
      id,
      email: `${id}@test.com`,
      name: `Test ${role} ${id}`,
      role,
      provider: 'google',
      providerId: `provider-${id}`,
    },
  })
}

/**
 * Create a test route with default step.
 */
export async function createTestRoute(
  id: string,
  createdById: string | null = null,
  options: Partial<{
    status: string
    source: string
    city: string
    difficulty: string
    title: string
  }> = {}
) {
  const prisma = await getPrisma()
  return prisma.route.create({
    data: {
      id,
      title: options.title || `Test Route ${id}`,
      description: `Description for ${id}`,
      city: options.city || 'tokyo',
      difficulty: options.difficulty || 'easy',
      estimatedMinutes: 30,
      distanceMeters: 1000,
      startLat: 35.68,
      startLng: 139.7,
      startName: 'Start Point',
      endLat: 35.69,
      endLng: 139.71,
      endName: 'End Point',
      tags: '[]',
      status: options.status || 'published',
      source: options.source || 'official',
      createdById,
      steps: {
        create: [
          {
            order: 1,
            instruction: 'Walk straight ahead',
            locationLat: 35.685,
            locationLng: 139.705,
            locationName: 'Midpoint',
          },
        ],
      },
    },
    include: {
      steps: true,
      createdBy: createdById
        ? { select: { id: true, name: true, avatar: true } }
        : false,
    },
  })
}

/**
 * Create a test route request.
 */
export async function createTestRouteRequest(
  createdById: string,
  options: Partial<{
    title: string
    city: string
    status: string
  }> = {}
) {
  const prisma = await getPrisma()
  return prisma.routeRequest.create({
    data: {
      title: options.title || 'Test Request',
      description: 'Please add this route for testing',
      city: options.city || 'tokyo',
      startPoint: 'Station A',
      endPoint: 'Station B',
      status: options.status || undefined, // use DB default 'pending'
      createdById,
    },
    include: {
      votes: true,
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  })
}

/**
 * Create a test review.
 */
export async function createTestReview(
  routeId: string,
  userId: string,
  options: Partial<{ rating: number; comment: string }> = {}
) {
  const prisma = await getPrisma()
  return prisma.review.create({
    data: {
      rating: options.rating || 4,
      comment: options.comment || 'Good route!',
      routeId,
      userId,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })
}

/**
 * FK-constraint-aware cleanup — deletes ALL test data with IDs starting with prefix.
 * Order: children first, then parents.
 */
export async function cleanupTestData(prefix: string) {
  const prisma = await getPrisma()

  // 1. Delete votes (child of routeRequest + user)
  await prisma.vote.deleteMany({
    where: {
      OR: [
        { userId: { startsWith: prefix } },
        { routeRequest: { createdById: { startsWith: prefix } } },
      ],
    },
  })

  // 2. Delete reviews (child of route + user)
  await prisma.review.deleteMany({
    where: {
      OR: [
        { userId: { startsWith: prefix } },
        { routeId: { startsWith: prefix } },
      ],
    },
  })

  // 3. Delete savedRoutes (child of route + user)
  await prisma.savedRoute.deleteMany({
    where: {
      OR: [
        { userId: { startsWith: prefix } },
        { routeId: { startsWith: prefix } },
      ],
    },
  })

  // 4. Delete steps (child of route)
  await prisma.step.deleteMany({
    where: { routeId: { startsWith: prefix } },
  })

  // 5. Delete routeRequests (child of user)
  await prisma.routeRequest.deleteMany({
    where: { createdById: { startsWith: prefix } },
  })

  // 6. Delete routes (references user)
  await prisma.route.deleteMany({
    where: { id: { startsWith: prefix } },
  })

  // 7. Delete users (root)
  await prisma.user.deleteMany({
    where: { id: { startsWith: prefix } },
  })
}
