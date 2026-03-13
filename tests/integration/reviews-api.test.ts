import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRoute, createTestReview, cleanupTestData } from '../helpers/db'
import getPrisma from '../../server/utils/prisma'

const PREFIX = 'rvw-'

describe('Reviews API Handlers', () => {
  let prisma: any
  let getReviewsHandler: any
  let postReviewHandler: any
  let putReviewHandler: any
  let deleteReviewHandler: any

  const userId = `${PREFIX}user`
  const userId2 = `${PREFIX}user2`
  const adminId = `${PREFIX}admin`

  const user = { id: userId, email: `${userId}@test.com`, name: 'Review User', role: 'USER' as const }
  const user2 = { id: userId2, email: `${userId2}@test.com`, name: 'Review User 2', role: 'USER' as const }
  const admin = { id: adminId, email: `${adminId}@test.com`, name: 'Review Admin', role: 'ADMIN' as const }

  const routeId = `${PREFIX}test-route`
  const emptyRouteId = `${PREFIX}empty-route`

  beforeAll(async () => {
    prisma = await getPrisma()
    await cleanupTestData(PREFIX)

    await createTestUser(userId, 'USER')
    await createTestUser(userId2, 'USER')
    await createTestUser(adminId, 'ADMIN')

    await createTestRoute(routeId, adminId, { status: 'published' })
    await createTestRoute(emptyRouteId, adminId, { status: 'published' })

    // Pre-create a review for GET tests
    await createTestReview(routeId, userId2, { rating: 4, comment: 'Nice route!' })

    getReviewsHandler = (await import('../../server/api/routes/[id]/reviews.get')).default
    postReviewHandler = (await import('../../server/api/routes/[id]/reviews.post')).default
    putReviewHandler = (await import('../../server/api/reviews/[id].put')).default
    deleteReviewHandler = (await import('../../server/api/reviews/[id].delete')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/routes/:id/reviews
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/routes/:id/reviews', () => {
    it('returns paginated reviews', async () => {
      const event = createMockEvent({
        method: 'GET',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
      })
      const result = await getReviewsHandler(event)

      expect(result).toHaveProperty('reviews')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('limit')
      expect(Array.isArray(result.reviews)).toBe(true)
      expect(result.total).toBeGreaterThanOrEqual(1)
    })

    it('returns empty array for route with no reviews', async () => {
      const event = createMockEvent({
        method: 'GET',
        path: `/api/routes/${emptyRouteId}/reviews`,
        params: { id: emptyRouteId },
      })
      const result = await getReviewsHandler(event)

      expect(result.reviews).toEqual([])
      expect(result.total).toBe(0)
    })

    it('returns 404 for nonexistent route', async () => {
      const event = createMockEvent({
        method: 'GET',
        path: '/api/routes/nonexistent-xyz/reviews',
        params: { id: 'nonexistent-xyz' },
      })
      await expect(getReviewsHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // POST /api/routes/:id/reviews
  // ──────────────────────────────────────────────────────────────
  describe('POST /api/routes/:id/reviews', () => {
    it('creates review with valid rating and comment', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
        body: { rating: 5, comment: 'Amazing route!' },
      })
      const result = await postReviewHandler(event)

      expect(result).toHaveProperty('id')
      expect(result.rating).toBe(5)
      expect(result.comment).toBe('Amazing route!')
      expect(result.createdBy.id).toBe(userId)
    })

    it('creates review with rating only (no comment)', async () => {
      // Need a fresh user who hasn't reviewed yet
      const freshUserId = `${PREFIX}fresh-user`
      await createTestUser(freshUserId, 'USER')
      mockUserSession({ id: freshUserId, email: `${freshUserId}@test.com`, name: 'Fresh User', role: 'USER' })

      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${emptyRouteId}/reviews`,
        params: { id: emptyRouteId },
        body: { rating: 3 },
      })
      const result = await postReviewHandler(event)

      expect(result.rating).toBe(3)
      expect(result.comment).toBeNull()
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
        body: { rating: 4 },
      })
      await expect(postReviewHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 404 for nonexistent route', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: '/api/routes/nonexistent-xyz/reviews',
        params: { id: 'nonexistent-xyz' },
        body: { rating: 4 },
      })
      await expect(postReviewHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('returns 409 for duplicate review', async () => {
      // user already reviewed routeId above
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
        body: { rating: 3, comment: 'Try again' },
      })
      await expect(postReviewHandler(event)).rejects.toMatchObject({ statusCode: 409 })
    })

    it('returns 400 for rating out of range (0)', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
        body: { rating: 0 },
      })
      await expect(postReviewHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 400 for rating out of range (6)', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
        body: { rating: 6 },
      })
      await expect(postReviewHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 400 for non-integer rating', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId}/reviews`,
        params: { id: routeId },
        body: { rating: 3.5 },
      })
      await expect(postReviewHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('recalculates averageRating on route after review', async () => {
      const route = await prisma.route.findUnique({ where: { id: routeId } })
      // At this point there are 2 reviews: user2 gave 4, user gave 5
      expect(route.reviewCount).toBeGreaterThanOrEqual(2)
      expect(route.averageRating).toBeGreaterThan(0)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // PUT /api/reviews/:id
  // ──────────────────────────────────────────────────────────────
  describe('PUT /api/reviews/:id', () => {
    let userReviewId: string

    beforeAll(async () => {
      // Find user's review created above
      const review = await prisma.review.findUnique({
        where: { routeId_userId: { routeId, userId } },
      })
      userReviewId = review.id
    })

    it('allows reviewer to update own review', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/reviews/${userReviewId}`,
        params: { id: userReviewId },
        body: { rating: 3, comment: 'Updated review' },
      })
      const result = await putReviewHandler(event)

      expect(result.rating).toBe(3)
      expect(result.comment).toBe('Updated review')
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/reviews/${userReviewId}`,
        params: { id: userReviewId },
        body: { rating: 2 },
      })
      await expect(putReviewHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 when another user tries to update', async () => {
      mockUserSession(user2)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/reviews/${userReviewId}`,
        params: { id: userReviewId },
        body: { rating: 1 },
      })
      await expect(putReviewHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })

    it('returns 404 for nonexistent review', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: '/api/reviews/nonexistent-id-xyz',
        params: { id: 'nonexistent-id-xyz' },
        body: { rating: 2 },
      })
      await expect(putReviewHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('recalculates averageRating after update', async () => {
      const route = await prisma.route.findUnique({ where: { id: routeId } })
      // user2=4, user=3 (just updated), avg=3.5
      expect(route.averageRating).toBe(3.5)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // DELETE /api/reviews/:id
  // ──────────────────────────────────────────────────────────────
  describe('DELETE /api/reviews/:id', () => {
    let deleteReviewId: string
    let adminDeleteReviewId: string

    beforeAll(async () => {
      // Create reviews for deletion tests
      const r1 = await createTestReview(routeId, adminId, { rating: 2, comment: 'To delete' })
      deleteReviewId = r1.id

      const deleteUserId = `${PREFIX}del-user`
      await createTestUser(deleteUserId, 'USER')
      const r2 = await createTestReview(emptyRouteId, deleteUserId, { rating: 5, comment: 'Admin will delete' })
      adminDeleteReviewId = r2.id
    })

    it('allows reviewer to delete own review', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/reviews/${deleteReviewId}`,
        params: { id: deleteReviewId },
      })
      const result = await deleteReviewHandler(event)
      expect(result.success).toBe(true)
    })

    it('allows ADMIN to delete any review', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/reviews/${adminDeleteReviewId}`,
        params: { id: adminDeleteReviewId },
      })
      const result = await deleteReviewHandler(event)
      expect(result.success).toBe(true)
    })

    it('returns 401 when not authenticated', async () => {
      // Use a real review ID (user2's review) since handler checks existence before auth
      const user2Review = await prisma.review.findUnique({
        where: { routeId_userId: { routeId, userId: userId2 } },
      })

      mockAnonymous()
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/reviews/${user2Review!.id}`,
        params: { id: user2Review!.id },
      })
      await expect(deleteReviewHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 for non-owner non-admin', async () => {
      // user2's review still exists on routeId
      const user2Review = await prisma.review.findUnique({
        where: { routeId_userId: { routeId, userId: userId2 } },
      })

      mockUserSession(user)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/reviews/${user2Review.id}`,
        params: { id: user2Review.id },
      })
      await expect(deleteReviewHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })

    it('returns 404 for nonexistent review', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'DELETE',
        path: '/api/reviews/nonexistent-xyz',
        params: { id: 'nonexistent-xyz' },
      })
      await expect(deleteReviewHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })
  })
})
