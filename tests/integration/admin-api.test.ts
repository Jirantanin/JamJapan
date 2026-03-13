import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRoute, createTestRouteRequest, cleanupTestData } from '../helpers/db'

const PREFIX = 'adm-'

describe('Admin API Handlers', () => {
  let adminRequestsHandler: any
  let adminStatusHandler: any
  let adminStatsHandler: any

  const userId = `${PREFIX}user`
  const adminId = `${PREFIX}admin`

  const user = { id: userId, email: `${userId}@test.com`, name: 'Admin Test User', role: 'USER' as const }
  const admin = { id: adminId, email: `${adminId}@test.com`, name: 'Admin', role: 'ADMIN' as const }

  let pendingReqId: string
  let fulfilledReqId: string

  beforeAll(async () => {
    await cleanupTestData(PREFIX)

    await createTestUser(userId, 'USER')
    await createTestUser(adminId, 'ADMIN')

    // Create routes for stats
    await createTestRoute(`${PREFIX}route-tokyo`, adminId, { city: 'tokyo', difficulty: 'easy' })
    await createTestRoute(`${PREFIX}route-osaka`, adminId, { city: 'osaka', difficulty: 'hard' })

    // Create requests for admin list
    const r1 = await createTestRouteRequest(userId, { title: 'Pending Req', city: 'tokyo' })
    pendingReqId = r1.id

    const r2 = await createTestRouteRequest(userId, { title: 'Fulfilled Req', city: 'osaka', status: 'fulfilled' })
    fulfilledReqId = r2.id

    adminRequestsHandler = (await import('../../server/api/admin/route-requests.get')).default
    adminStatusHandler = (await import('../../server/api/admin/route-requests/[id]/status.put')).default
    adminStatsHandler = (await import('../../server/api/admin/stats.get')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/admin/route-requests
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/admin/route-requests', () => {
    it('returns all requests for ADMIN (status=all)', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'GET',
        path: '/api/admin/route-requests',
      })
      const result = await adminRequestsHandler(event)

      expect(result).toHaveProperty('requests')
      expect(result).toHaveProperty('total')
      expect(result.total).toBeGreaterThanOrEqual(2)
    })

    it('filters by status', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'GET',
        path: '/api/admin/route-requests',
        query: { status: 'pending' },
      })
      const result = await adminRequestsHandler(event)

      for (const req of result.requests) {
        expect(req.status).toBe('pending')
      }
    })

    it('sorts by votes', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'GET',
        path: '/api/admin/route-requests',
        query: { sort: 'votes' },
      })
      const result = await adminRequestsHandler(event)
      expect(result.requests.length).toBeGreaterThanOrEqual(1)
    })

    it('sorts by newest', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'GET',
        path: '/api/admin/route-requests',
        query: { sort: 'newest' },
      })
      const result = await adminRequestsHandler(event)
      expect(result.requests.length).toBeGreaterThanOrEqual(1)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'GET',
        path: '/api/admin/route-requests',
      })
      await expect(adminRequestsHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 when USER role', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'GET',
        path: '/api/admin/route-requests',
      })
      await expect(adminRequestsHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // PUT /api/admin/route-requests/:id/status
  // ──────────────────────────────────────────────────────────────
  describe('PUT /api/admin/route-requests/:id/status', () => {
    it('ADMIN sets status to fulfilled', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'fulfilled' },
      })
      const result = await adminStatusHandler(event)
      expect(result.status).toBe('fulfilled')
    })

    it('ADMIN sets status to closed', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'closed' },
      })
      const result = await adminStatusHandler(event)
      expect(result.status).toBe('closed')
    })

    it('ADMIN sets status back to pending', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'pending' },
      })
      const result = await adminStatusHandler(event)
      expect(result.status).toBe('pending')
    })

    it('allows setting fulfilledRouteId', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'fulfilled', fulfilledRouteId: `${PREFIX}route-tokyo` },
      })
      const result = await adminStatusHandler(event)
      expect(result.status).toBe('fulfilled')
      expect(result.fulfilledRouteId).toBe(`${PREFIX}route-tokyo`)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'fulfilled' },
      })
      await expect(adminStatusHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 when USER', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'fulfilled' },
      })
      await expect(adminStatusHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })

    it('returns 400 for invalid status', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/admin/route-requests/${pendingReqId}/status`,
        params: { id: pendingReqId },
        body: { status: 'invalid-status' },
      })
      await expect(adminStatusHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 404 for nonexistent request', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: '/api/admin/route-requests/nonexistent-xyz/status',
        params: { id: 'nonexistent-xyz' },
        body: { status: 'fulfilled' },
      })
      await expect(adminStatusHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/admin/stats
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/admin/stats', () => {
    it('returns stats for ADMIN', async () => {
      mockUserSession(admin)
      const event = createMockEvent({ method: 'GET', path: '/api/admin/stats' })
      const result = await adminStatsHandler(event)

      expect(result).toHaveProperty('totalRoutes')
      expect(result).toHaveProperty('byCity')
      expect(result).toHaveProperty('byDifficulty')
      expect(result).toHaveProperty('recentRoutes')
      expect(result).toHaveProperty('totalRequests')
      expect(result).toHaveProperty('pendingRequests')
    })

    it('includes totalRoutes, byCity, byDifficulty arrays', async () => {
      mockUserSession(admin)
      const event = createMockEvent({ method: 'GET', path: '/api/admin/stats' })
      const result = await adminStatsHandler(event)

      expect(typeof result.totalRoutes).toBe('number')
      expect(Array.isArray(result.byCity)).toBe(true)
      expect(Array.isArray(result.byDifficulty)).toBe(true)
      expect(Array.isArray(result.recentRoutes)).toBe(true)

      // byCity items should have city + count
      for (const item of result.byCity) {
        expect(item).toHaveProperty('city')
        expect(item).toHaveProperty('count')
      }
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/admin/stats' })
      await expect(adminStatsHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 when USER', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/admin/stats' })
      await expect(adminStatsHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })
  })
})
