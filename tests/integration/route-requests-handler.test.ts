import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRouteRequest, cleanupTestData } from '../helpers/db'
import getPrisma from '../../server/utils/prisma'

const PREFIX = 'rreqh-'

describe('Route Requests Handler Tests', () => {
  let prisma: any

  let getListHandler: any
  let postHandler: any
  let putHandler: any
  let deleteHandler: any
  let voteHandler: any

  const userId = `${PREFIX}user`
  const userId2 = `${PREFIX}user2`
  const adminId = `${PREFIX}admin`

  const user = { id: userId, email: `${userId}@test.com`, name: 'Req User', role: 'USER' as const }
  const user2 = { id: userId2, email: `${userId2}@test.com`, name: 'Req User2', role: 'USER' as const }
  const admin = { id: adminId, email: `${adminId}@test.com`, name: 'Req Admin', role: 'ADMIN' as const }

  let requestId1: string
  let requestId2: string
  let requestByUser2: string

  beforeAll(async () => {
    prisma = await getPrisma()
    await cleanupTestData(PREFIX)

    await createTestUser(userId, 'USER')
    await createTestUser(userId2, 'USER')
    await createTestUser(adminId, 'ADMIN')

    const r1 = await createTestRouteRequest(userId, { title: 'Tokyo Walk', city: 'tokyo' })
    requestId1 = r1.id

    const r2 = await createTestRouteRequest(userId, { title: 'Osaka Walk', city: 'osaka' })
    requestId2 = r2.id

    const r3 = await createTestRouteRequest(userId2, { title: 'User2 Request', city: 'kyoto' })
    requestByUser2 = r3.id

    getListHandler = (await import('../../server/api/route-requests/index.get')).default
    postHandler = (await import('../../server/api/route-requests/index.post')).default
    putHandler = (await import('../../server/api/route-requests/[id].put')).default
    deleteHandler = (await import('../../server/api/route-requests/[id].delete')).default
    voteHandler = (await import('../../server/api/route-requests/[id]/vote.post')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/route-requests
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/route-requests', () => {
    it('returns pending requests by default', async () => {
      mockAnonymous()
      // Filter by city to only get our test data (avoids orphaned data from other tests)
      const event = createMockEvent({ method: 'GET', path: '/api/route-requests', query: { city: 'tokyo' } })
      const result = await getListHandler(event)

      expect(result).toHaveProperty('requests')
      expect(result).toHaveProperty('total')
      expect(Array.isArray(result.requests)).toBe(true)
      expect(result.total).toBeGreaterThanOrEqual(1)
      for (const req of result.requests) {
        expect(req.status).toBe('pending')
        expect(req.city).toBe('tokyo')
      }
    })

    it('filters by city', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'GET',
        path: '/api/route-requests',
        query: { city: 'osaka' },
      })
      const result = await getListHandler(event)

      for (const req of result.requests) {
        expect(req.city).toBe('osaka')
      }
    })

    it('includes hasVoted for authenticated user', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/route-requests' })
      const result = await getListHandler(event)

      for (const req of result.requests) {
        expect(req).toHaveProperty('hasVoted')
        expect(typeof req.hasVoted).toBe('boolean')
      }
    })
  })

  // ──────────────────────────────────────────────────────────────
  // POST /api/route-requests
  // ──────────────────────────────────────────────────────────────
  describe('POST /api/route-requests', () => {
    it('creates with status=pending and voteCount=0', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: '/api/route-requests',
        body: {
          title: 'New Test Request',
          description: 'Please add this walking route',
          city: 'tokyo',
          startPoint: 'Station A',
          endPoint: 'Station B',
        },
      })
      const result = await postHandler(event)

      expect(result).toHaveProperty('id')
      expect(result.status).toBe('pending')
      expect(result.voteCount).toBe(0)
      expect(result.title).toBe('New Test Request')
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'POST',
        path: '/api/route-requests',
        body: {
          title: 'Fail',
          description: 'Should fail',
          city: 'tokyo',
          startPoint: 'A',
          endPoint: 'B',
        },
      })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 400 for invalid body', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: '/api/route-requests',
        body: { title: '' }, // missing required fields
      })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // PUT /api/route-requests/:id
  // ──────────────────────────────────────────────────────────────
  describe('PUT /api/route-requests/:id', () => {
    it('allows owner to update pending request', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/route-requests/${requestId1}`,
        params: { id: requestId1 },
        body: { title: 'Updated Tokyo Walk' },
      })
      const result = await putHandler(event)

      expect(result.title).toBe('Updated Tokyo Walk')
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/route-requests/${requestId1}`,
        params: { id: requestId1 },
        body: { title: 'Fail' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 for non-owner', async () => {
      mockUserSession(user2)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/route-requests/${requestId1}`,
        params: { id: requestId1 },
        body: { title: 'Not my request' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })

    it('returns 400 for non-pending request', async () => {
      // Set request to fulfilled directly
      await prisma.routeRequest.update({
        where: { id: requestId2 },
        data: { status: 'fulfilled' },
      })

      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/route-requests/${requestId2}`,
        params: { id: requestId2 },
        body: { title: 'Cannot edit' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 400 })

      // Reset to pending
      await prisma.routeRequest.update({
        where: { id: requestId2 },
        data: { status: 'pending' },
      })
    })

    it('returns 404 for nonexistent request', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: '/api/route-requests/nonexistent-xyz',
        params: { id: 'nonexistent-xyz' },
        body: { title: 'No exist' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // DELETE /api/route-requests/:id
  // ──────────────────────────────────────────────────────────────
  describe('DELETE /api/route-requests/:id', () => {
    let deleteReqId: string
    let adminDeleteReqId: string

    beforeAll(async () => {
      const r1 = await createTestRouteRequest(userId, { title: 'To delete by owner' })
      deleteReqId = r1.id
      const r2 = await createTestRouteRequest(userId2, { title: 'To delete by admin' })
      adminDeleteReqId = r2.id
    })

    it('allows owner to delete', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/route-requests/${deleteReqId}`,
        params: { id: deleteReqId },
      })
      const result = await deleteHandler(event)
      expect(result.success).toBe(true)
    })

    it('allows ADMIN to delete any', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/route-requests/${adminDeleteReqId}`,
        params: { id: adminDeleteReqId },
      })
      const result = await deleteHandler(event)
      expect(result.success).toBe(true)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/route-requests/${requestId1}`,
        params: { id: requestId1 },
      })
      await expect(deleteHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 for non-owner non-admin', async () => {
      mockUserSession(user2)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/route-requests/${requestId1}`,
        params: { id: requestId1 },
      })
      await expect(deleteHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // POST /api/route-requests/:id/vote — Toggle vote
  // ──────────────────────────────────────────────────────────────
  describe('POST /api/route-requests/:id/vote', () => {
    it('adds vote (returns { voted: true })', async () => {
      mockUserSession(user2)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestId1}/vote`,
        params: { id: requestId1 },
      })
      const result = await voteHandler(event)
      expect(result.voted).toBe(true)
      expect(result.voteCount).toBe(1)
    })

    it('removes vote on second call', async () => {
      mockUserSession(user2)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestId1}/vote`,
        params: { id: requestId1 },
      })
      const result = await voteHandler(event)
      expect(result.voted).toBe(false)
      expect(result.voteCount).toBe(0)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestId1}/vote`,
        params: { id: requestId1 },
      })
      await expect(voteHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 400 voting on own request', async () => {
      mockUserSession(user) // user owns requestId1
      const event = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestId1}/vote`,
        params: { id: requestId1 },
      })
      await expect(voteHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 404 for nonexistent request', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: '/api/route-requests/nonexistent-xyz/vote',
        params: { id: 'nonexistent-xyz' },
      })
      await expect(voteHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('increments/decrements voteCount correctly', async () => {
      // Vote with user2
      mockUserSession(user2)
      const e1 = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestByUser2}/vote`,
        params: { id: requestByUser2 },
      })
      // user cannot vote on user2's request, but user2 cannot vote on own
      // Let's use admin to vote on user2's request
      mockUserSession(admin)
      const e2 = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestByUser2}/vote`,
        params: { id: requestByUser2 },
      })
      const result1 = await voteHandler(e2)
      expect(result1.voted).toBe(true)
      expect(result1.voteCount).toBe(1)

      // Verify in DB
      const req = await prisma.routeRequest.findUnique({ where: { id: requestByUser2 } })
      expect(req.voteCount).toBe(1)

      // Unvote
      mockUserSession(admin)
      const e3 = createMockEvent({
        method: 'POST',
        path: `/api/route-requests/${requestByUser2}/vote`,
        params: { id: requestByUser2 },
      })
      const result2 = await voteHandler(e3)
      expect(result2.voted).toBe(false)
      expect(result2.voteCount).toBe(0)
    })
  })
})
