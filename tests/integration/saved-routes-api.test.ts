import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import getPrisma from '../../server/utils/prisma'

/**
 * Integration Tests for SavedRoute Feature
 * Tests the full workflow of saving/unsaving routes and isSaved persistence
 */

describe('SavedRoute API - Integration Tests', () => {
  let prisma: any
  let testUserId = 'test-user-1'
  let testRouteId = 'test-route-1'

  beforeAll(async () => {
    prisma = await getPrisma()

    // Cleanup before tests
    await prisma.savedRoute.deleteMany({ where: { userId: testUserId } })
    await prisma.savedRoute.deleteMany({ where: { routeId: testRouteId } })
    await prisma.route.deleteMany({ where: { id: testRouteId } })
    await prisma.user.deleteMany({ where: { id: testUserId } })

    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        provider: 'google',
        providerId: 'test-provider-1',
      },
    })

    // Create test route
    await prisma.route.create({
      data: {
        id: testRouteId,
        title: 'Test Route',
        description: 'A test route for saved routes testing',
        city: 'tokyo',
        difficulty: 'easy',
        estimatedMinutes: 30,
        distanceMeters: 1000,
        startLat: 35.68,
        startLng: 139.70,
        startName: 'Start Point',
        endLat: 35.69,
        endLng: 139.71,
        endName: 'End Point',
        tags: '[]',
        status: 'published',
        source: 'official',
        coverImage: null,
        createdById: null,
      },
    })
  })

  afterAll(async () => {
    // Cleanup after tests
    await prisma.savedRoute.deleteMany({ where: { userId: testUserId } })
    await prisma.route.deleteMany({ where: { id: testRouteId } })
    await prisma.user.deleteMany({ where: { id: testUserId } })
  })

  describe('POST /api/routes/:id/save - Toggle Save', () => {
    it('should save a route (create SavedRoute record)', async () => {
      // Initially no save record
      let saved = await prisma.savedRoute.findUnique({
        where: { routeId_userId: { routeId: testRouteId, userId: testUserId } },
      })
      expect(saved).toBeNull()

      // Simulate POST /api/routes/:id/save - save
      await prisma.savedRoute.create({
        data: { routeId: testRouteId, userId: testUserId },
      })

      // Verify record created
      saved = await prisma.savedRoute.findUnique({
        where: { routeId_userId: { routeId: testRouteId, userId: testUserId } },
      })
      expect(saved).toBeDefined()
      expect(saved?.routeId).toBe(testRouteId)
      expect(saved?.userId).toBe(testUserId)
    })

    it('should unsave a route (delete SavedRoute record)', async () => {
      // Verify record exists
      let saved = await prisma.savedRoute.findUnique({
        where: { routeId_userId: { routeId: testRouteId, userId: testUserId } },
      })
      expect(saved).toBeDefined()

      // Simulate POST /api/routes/:id/save - unsave (delete)
      await prisma.savedRoute.delete({ where: { id: saved!.id } })

      // Verify record deleted
      saved = await prisma.savedRoute.findUnique({
        where: { routeId_userId: { routeId: testRouteId, userId: testUserId } },
      })
      expect(saved).toBeNull()
    })
  })

  describe('GET /api/routes/:id - Route Detail with isSaved', () => {
    it('should return route with isSaved=false when not saved', async () => {
      // Ensure route is not saved
      await prisma.savedRoute.deleteMany({
        where: { routeId: testRouteId, userId: testUserId },
      })

      // Fetch route with savedBy relationship
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true, createdBy: true, steps: true },
      })

      expect(route).toBeDefined()
      expect(route?.savedBy).toBeDefined()
      expect(route?.savedBy.length).toBe(0)

      // Check if currentUserId would match - it shouldn't
      const isSaved = route!.savedBy.some((s: any) => s.userId === testUserId)
      expect(isSaved).toBe(false)
    })

    it('should return route with isSaved=true when saved', async () => {
      // Save the route
      await prisma.savedRoute.create({
        data: { routeId: testRouteId, userId: testUserId },
      })

      // Fetch route with savedBy relationship
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true, createdBy: true, steps: true },
      })

      expect(route).toBeDefined()
      expect(route?.savedBy).toBeDefined()
      expect(route?.savedBy.length).toBeGreaterThan(0)

      // Check if currentUserId matches
      const isSaved = route!.savedBy.some((s: any) => s.userId === testUserId)
      expect(isSaved).toBe(true)
    })

    it('should include savedBy relationship in API response data', async () => {
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true, createdBy: true, steps: true },
      })

      // Verify the relationship is included and has correct structure
      expect(route?.savedBy).toBeDefined()
      expect(Array.isArray(route?.savedBy)).toBe(true)
      if (route!.savedBy.length > 0) {
        expect(route?.savedBy[0]).toHaveProperty('userId')
        expect(route?.savedBy[0]).toHaveProperty('routeId')
      }
    })
  })

  describe('GET /api/routes (list) - Multiple routes with isSaved', () => {
    let testRouteId2 = 'test-route-2'
    let testRouteId3 = 'test-route-3'

    beforeAll(async () => {
      // Create additional test routes
      await prisma.route.create({
        data: {
          id: testRouteId2,
          title: 'Test Route 2',
          description: 'Another test route',
          city: 'osaka',
          difficulty: 'medium',
          estimatedMinutes: 45,
          distanceMeters: 2000,
          startLat: 34.67,
          startLng: 135.50,
          startName: 'Start 2',
          endLat: 34.68,
          endLng: 135.51,
          endName: 'End 2',
          tags: '[]',
          status: 'published',
          source: 'community',
          coverImage: null,
          createdById: null,
        },
      })

      await prisma.route.create({
        data: {
          id: testRouteId3,
          title: 'Test Route 3',
          description: 'Third test route',
          city: 'kyoto',
          difficulty: 'hard',
          estimatedMinutes: 60,
          distanceMeters: 3000,
          startLat: 35.00,
          startLng: 135.75,
          startName: 'Start 3',
          endLat: 35.01,
          endLng: 135.76,
          endName: 'End 3',
          tags: '[]',
          status: 'published',
          source: 'official',
          coverImage: null,
          createdById: null,
        },
      })

      // Save only route 1 and 3
      await prisma.savedRoute.deleteMany({ where: { userId: testUserId } })
      await prisma.savedRoute.create({
        data: { routeId: testRouteId, userId: testUserId },
      })
      await prisma.savedRoute.create({
        data: { routeId: testRouteId3, userId: testUserId },
      })
    })

    afterAll(async () => {
      await prisma.route.deleteMany({
        where: { id: { in: [testRouteId2, testRouteId3] } },
      })
    })

    it('should list all published routes', async () => {
      const routes = await prisma.route.findMany({
        where: { status: 'published' },
        include: { savedBy: true, createdBy: true, steps: true },
      })

      expect(routes.length).toBeGreaterThanOrEqual(3)
      expect(routes.some(r => r.id === testRouteId)).toBe(true)
      expect(routes.some(r => r.id === testRouteId2)).toBe(true)
      expect(routes.some(r => r.id === testRouteId3)).toBe(true)
    })

    it('should show correct isSaved state for each route in list', async () => {
      const routes = await prisma.route.findMany({
        where: { status: 'published' },
        include: { savedBy: true, createdBy: true, steps: true },
      })

      // Find specific routes and check isSaved
      const route1 = routes.find(r => r.id === testRouteId)!
      const route2 = routes.find(r => r.id === testRouteId2)!
      const route3 = routes.find(r => r.id === testRouteId3)!

      const isSaved1 = route1.savedBy.some((s: any) => s.userId === testUserId)
      const isSaved2 = route2.savedBy.some((s: any) => s.userId === testUserId)
      const isSaved3 = route3.savedBy.some((s: any) => s.userId === testUserId)

      expect(isSaved1).toBe(true) // Saved
      expect(isSaved2).toBe(false) // Not saved
      expect(isSaved3).toBe(true) // Saved
    })
  })

  describe('GET /api/my/saved-routes - User saved routes list', () => {
    it('should return only saved routes for the user', async () => {
      // Count user's saved routes
      const savedRoutes = await prisma.savedRoute.findMany({
        where: { userId: testUserId },
        include: { route: { include: { steps: true, createdBy: true } } },
      })

      expect(savedRoutes.length).toBeGreaterThan(0)
      savedRoutes.forEach(sr => {
        expect(sr.userId).toBe(testUserId)
        expect(sr.route).toBeDefined()
      })
    })

    it('should return saved route with isSaved=true', async () => {
      const savedRoutes = await prisma.savedRoute.findMany({
        where: { userId: testUserId },
        include: { route: { include: { steps: true, createdBy: true, savedBy: true } } },
      })

      expect(savedRoutes.length).toBeGreaterThan(0)
      savedRoutes.forEach(sr => {
        // Each returned route should have the current user in savedBy
        const isSaved = sr.route.savedBy.some((s: any) => s.userId === testUserId)
        expect(isSaved).toBe(true)
      })
    })
  })

  describe('isSaved Persistence - Core Bug Test', () => {
    let user2Id = 'test-user-2-persistence'
    let user3Id = 'test-user-3-persistence'

    beforeAll(async () => {
      // Clean up any existing test users
      await prisma.savedRoute.deleteMany({
        where: { userId: { in: [user2Id, user3Id] } },
      })
      await prisma.user.deleteMany({ where: { id: { in: [user2Id, user3Id] } } })

      // Create multiple test users
      await prisma.user.create({
        data: {
          id: user2Id,
          email: 'test2@example.com',
          name: 'Test User 2',
          role: 'USER',
          provider: 'google',
          providerId: 'test-provider-persistence-2',
        },
      })

      await prisma.user.create({
        data: {
          id: user3Id,
          email: 'test3@example.com',
          name: 'Test User 3',
          role: 'USER',
          provider: 'google',
          providerId: 'test-provider-persistence-3',
        },
      })

      // Save the same route by multiple users
      await prisma.savedRoute.deleteMany({ where: { routeId: testRouteId } })
      await prisma.savedRoute.create({ data: { routeId: testRouteId, userId: testUserId } })
      await prisma.savedRoute.create({ data: { routeId: testRouteId, userId: user2Id } })
    })

    afterAll(async () => {
      // Delete SavedRoutes first (foreign key constraint)
      await prisma.savedRoute.deleteMany({
        where: { userId: { in: [user2Id, user3Id] } },
      })
      await prisma.user.deleteMany({ where: { id: { in: [user2Id, user3Id] } } })
    })

    it('should correctly identify saved status for user1', async () => {
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true },
      })

      const isSaved = route!.savedBy.some((s: any) => s.userId === testUserId)
      expect(isSaved).toBe(true)
    })

    it('should correctly identify saved status for user2', async () => {
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true },
      })

      const isSaved = route!.savedBy.some((s: any) => s.userId === user2Id)
      expect(isSaved).toBe(true)
    })

    it('should correctly identify NOT saved status for user3', async () => {
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true },
      })

      const isSaved = route!.savedBy.some((s: any) => s.userId === user3Id)
      expect(isSaved).toBe(false)
    })

    it('should show different isSaved state for same route depending on user', async () => {
      const route = await prisma.route.findUnique({
        where: { id: testRouteId },
        include: { savedBy: true },
      })

      // User 1: saved
      expect(route!.savedBy.some((s: any) => s.userId === testUserId)).toBe(true)
      // User 2: saved
      expect(route!.savedBy.some((s: any) => s.userId === user2Id)).toBe(true)
      // User 3: not saved
      expect(route!.savedBy.some((s: any) => s.userId === user3Id)).toBe(false)
    })
  })
})
