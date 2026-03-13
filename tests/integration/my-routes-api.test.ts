import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRoute, cleanupTestData } from '../helpers/db'

const PREFIX = 'myrt-'

describe('My Routes & Cities API Handlers', () => {
  let myRoutesHandler: any
  let citiesHandler: any

  const userId = `${PREFIX}user`
  const userId2 = `${PREFIX}user2`

  const user = { id: userId, email: `${userId}@test.com`, name: 'My Routes User', role: 'USER' as const }
  const user2 = { id: userId2, email: `${userId2}@test.com`, name: 'Other User', role: 'USER' as const }

  beforeAll(async () => {
    await cleanupTestData(PREFIX)

    await createTestUser(userId, 'USER')
    await createTestUser(userId2, 'USER')

    // Create routes for user
    await createTestRoute(`${PREFIX}pub-route`, userId, { status: 'published', city: 'tokyo' })
    await createTestRoute(`${PREFIX}draft-route`, userId, { status: 'draft', city: 'tokyo' })
    await createTestRoute(`${PREFIX}osaka-route`, userId, { status: 'published', city: 'osaka' })

    // Create route for user2 (should not appear in user's list)
    await createTestRoute(`${PREFIX}user2-route`, userId2, { status: 'published', city: 'kyoto' })

    myRoutesHandler = (await import('../../server/api/my/routes.get')).default
    citiesHandler = (await import('../../server/api/cities.get')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/my/routes
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/my/routes', () => {
    it('returns routes created by authenticated user', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/my/routes' })
      const result = await myRoutesHandler(event)

      expect(result).toHaveProperty('routes')
      expect(result).toHaveProperty('total')
      expect(result.total).toBe(3)
      for (const route of result.routes) {
        expect(route.createdBy.id).toBe(userId)
      }
    })

    it('filters by status', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'GET',
        path: '/api/my/routes',
        query: { status: 'draft' },
      })
      const result = await myRoutesHandler(event)

      expect(result.total).toBe(1)
      expect(result.routes[0].status).toBe('draft')
    })

    it('returns empty when user has no routes', async () => {
      const freshId = `${PREFIX}fresh`
      await createTestUser(freshId, 'USER')
      mockUserSession({ id: freshId, email: `${freshId}@test.com`, name: 'Fresh', role: 'USER' })

      const event = createMockEvent({ method: 'GET', path: '/api/my/routes' })
      const result = await myRoutesHandler(event)

      expect(result.routes).toEqual([])
      expect(result.total).toBe(0)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/my/routes' })
      await expect(myRoutesHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('does not return routes by other users', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/my/routes' })
      const result = await myRoutesHandler(event)

      const otherUserRoute = result.routes.find((r: any) => r.id === `${PREFIX}user2-route`)
      expect(otherUserRoute).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/cities
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/cities', () => {
    it('returns city list with route counts', async () => {
      const event = createMockEvent({ method: 'GET', path: '/api/cities' })
      const result = await citiesHandler(event)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThanOrEqual(1)
      for (const item of result) {
        expect(item).toHaveProperty('city')
        expect(item).toHaveProperty('count')
        expect(typeof item.city).toBe('string')
        expect(typeof item.count).toBe('number')
      }
    })

    it('works without authentication (public)', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/cities' })
      const result = await citiesHandler(event)

      expect(Array.isArray(result)).toBe(true)
    })
  })
})
