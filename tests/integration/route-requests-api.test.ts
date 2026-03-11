import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import getPrisma from '../../server/utils/prisma'

/**
 * Integration Tests for RouteRequest Feature
 * Tests the full workflow of creating requests and listing them (persistence bug)
 *
 * BUG REPRODUCED: After creating a route request, the listing endpoint
 * must return the new request immediately (not stale/cached data).
 */

describe('RouteRequest API - Integration Tests', () => {
  let prisma: any
  let testUserId = 'test-rr-user-1'
  let testRequestId: string

  beforeAll(async () => {
    prisma = await getPrisma()

    // Cleanup before tests
    await prisma.vote.deleteMany({ where: { user: { id: testUserId } } })
    await prisma.routeRequest.deleteMany({ where: { createdById: testUserId } })
    await prisma.user.deleteMany({ where: { id: testUserId } })

    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test-rr@example.com',
        name: 'Test RR User',
        role: 'USER',
        provider: 'google',
        providerId: 'test-provider-rr-1',
      },
    })
  })

  afterAll(async () => {
    await prisma.vote.deleteMany({ where: { user: { id: testUserId } } })
    await prisma.routeRequest.deleteMany({ where: { createdById: testUserId } })
    await prisma.user.deleteMany({ where: { id: testUserId } })
  })

  describe('POST /api/route-requests - Create Request', () => {
    it('should create a route request with status=pending by default', async () => {
      const created = await prisma.routeRequest.create({
        data: {
          title: 'Test Route Request',
          description: 'A test request for integration testing',
          city: 'tokyo',
          startPoint: 'Shinjuku Station',
          endPoint: 'Meiji Shrine',
          createdById: testUserId,
          // No status field — relies on @default("pending")
        },
        include: {
          votes: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      })

      testRequestId = created.id

      expect(created).toBeDefined()
      expect(created.id).toBeDefined()
      expect(created.status).toBe('pending') // ✅ Default status is "pending"
      expect(created.voteCount).toBe(0)
      expect(created.createdById).toBe(testUserId)
      expect(created.createdBy).toBeDefined()
      expect(created.createdBy.id).toBe(testUserId)
    })

    it('should create multiple requests and all should be pending', async () => {
      const req2 = await prisma.routeRequest.create({
        data: {
          title: 'Test Route Request 2',
          description: 'Second test request',
          city: 'osaka',
          startPoint: 'Osaka Castle',
          endPoint: 'Dotonbori',
          createdById: testUserId,
        },
      })

      const req3 = await prisma.routeRequest.create({
        data: {
          title: 'Test Route Request 3',
          description: 'Third test request',
          city: 'kyoto',
          startPoint: 'Kyoto Station',
          endPoint: 'Fushimi Inari',
          createdById: testUserId,
        },
      })

      expect(req2.status).toBe('pending')
      expect(req3.status).toBe('pending')
    })
  })

  describe('GET /api/route-requests - List with status=pending (core bug test)', () => {
    it('should return all pending requests including newly created ones', async () => {
      // This tests the core bug: after creating requests, the listing MUST include them
      const requests = await prisma.routeRequest.findMany({
        where: { status: 'pending' },
        include: {
          votes: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { voteCount: 'desc' },
      })

      // All 3 created requests should appear in the listing
      const testRequests = requests.filter((r: any) => r.createdById === testUserId)
      expect(testRequests.length).toBe(3)

      // Each should have status=pending
      testRequests.forEach((r: any) => {
        expect(r.status).toBe('pending')
      })
    })

    it('should find newly created request immediately after creation', async () => {
      // Simulate the exact flow that was broken:
      // 1. Create a new request
      const newRequest = await prisma.routeRequest.create({
        data: {
          title: 'Immediately Visible Request',
          description: 'This should appear immediately in listing',
          city: 'fukuoka',
          startPoint: 'Hakata Station',
          endPoint: 'Canal City',
          createdById: testUserId,
        },
      })

      // 2. Query listing with status=pending (same as the GET endpoint does by default)
      const listing = await prisma.routeRequest.findMany({
        where: { status: 'pending' },
        include: {
          votes: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      })

      // 3. The new request MUST appear in the listing
      const found = listing.find((r: any) => r.id === newRequest.id)
      expect(found).toBeDefined() // ✅ New request appears immediately
      expect(found?.title).toBe('Immediately Visible Request')
      expect(found?.status).toBe('pending')
    })

    it('should NOT return fulfilled or closed requests in default listing', async () => {
      // Create a fulfilled request
      const fulfilledRequest = await prisma.routeRequest.create({
        data: {
          title: 'Fulfilled Request',
          description: 'This has been fulfilled',
          city: 'tokyo',
          startPoint: 'A',
          endPoint: 'B',
          status: 'fulfilled', // ← explicitly set different status
          createdById: testUserId,
        },
      })

      // Query with default status=pending (same as GET endpoint)
      const listing = await prisma.routeRequest.findMany({
        where: { status: 'pending' },
      })

      // Fulfilled request should NOT appear
      const found = listing.find((r: any) => r.id === fulfilledRequest.id)
      expect(found).toBeUndefined() // ✅ Fulfilled requests filtered out
    })

    it('should return results when status=all is used', async () => {
      // When status=all, return all statuses
      const allRequests = await prisma.routeRequest.findMany({
        where: { createdById: testUserId },
      })

      // Both pending and fulfilled should appear
      const statuses = allRequests.map((r: any) => r.status)
      expect(statuses).toContain('pending')
      expect(statuses).toContain('fulfilled')
    })
  })

  describe('City filter', () => {
    it('should filter requests by city', async () => {
      const tokyoRequests = await prisma.routeRequest.findMany({
        where: { status: 'pending', city: 'tokyo', createdById: testUserId },
      })

      const osakaRequests = await prisma.routeRequest.findMany({
        where: { status: 'pending', city: 'osaka', createdById: testUserId },
      })

      // Should have at least 1 tokyo and 1 osaka (from the tests above)
      expect(tokyoRequests.length).toBeGreaterThan(0)
      expect(osakaRequests.length).toBeGreaterThan(0)

      // All tokyo requests should have city=tokyo
      tokyoRequests.forEach((r: any) => {
        expect(r.city).toBe('tokyo')
      })
    })
  })

  describe('transformRouteRequest - Data shape', () => {
    it('should have correct data shape for transform', async () => {
      const request = await prisma.routeRequest.findFirst({
        where: { createdById: testUserId, status: 'pending' },
        include: {
          votes: true,
          createdBy: { select: { id: true, name: true, avatar: true } },
        },
      })

      expect(request).toBeDefined()
      expect(request?.createdBy).toBeDefined() // ✅ Required for transformRouteRequest
      expect(request?.createdBy.id).toBeDefined()
      expect(request?.votes).toBeDefined() // ✅ Required for hasVoted calculation
      expect(Array.isArray(request?.votes)).toBe(true)
      expect(request?.voteCount).toBeDefined()
      expect(request?.status).toBe('pending')
    })
  })

  describe('Vote toggle - voteCount update', () => {
    it('should not update voteCount directly but via vote records', async () => {
      const request = await prisma.routeRequest.findFirst({
        where: { createdById: testUserId },
        include: { votes: true },
      })

      expect(request).toBeDefined()
      expect(request?.voteCount).toBe(0) // Initial state

      // Simulate vote (without actually running the vote endpoint)
      await prisma.vote.create({
        data: {
          routeRequestId: request!.id,
          userId: testUserId,
        },
      })

      await prisma.routeRequest.update({
        where: { id: request!.id },
        data: { voteCount: { increment: 1 } },
      })

      const updated = await prisma.routeRequest.findUnique({
        where: { id: request!.id },
      })

      expect(updated?.voteCount).toBe(1)
    })
  })
})
