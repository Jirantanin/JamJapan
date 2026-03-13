import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRoute, cleanupTestData } from '../helpers/db'

const PREFIX = 'saveh-'

describe('Saved Routes Handler Tests', () => {
  let saveHandler: any
  let getSavedHandler: any

  const userId = `${PREFIX}user`
  const user = { id: userId, email: `${userId}@test.com`, name: 'Save User', role: 'USER' as const }

  const routeId1 = `${PREFIX}route1`
  const routeId2 = `${PREFIX}route2`

  beforeAll(async () => {
    await cleanupTestData(PREFIX)

    await createTestUser(userId, 'USER')
    await createTestRoute(routeId1, null, { status: 'published' })
    await createTestRoute(routeId2, null, { status: 'published' })

    saveHandler = (await import('../../server/api/routes/[id]/save.post')).default
    getSavedHandler = (await import('../../server/api/my/saved-routes.get')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  // ──────────────────────────────────────────────────────────────
  // POST /api/routes/:id/save — Toggle save
  // ──────────────────────────────────────────────────────────────
  describe('POST /api/routes/:id/save', () => {
    it('saves route (returns { saved: true })', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId1}/save`,
        params: { id: routeId1 },
      })
      const result = await saveHandler(event)
      expect(result.saved).toBe(true)
    })

    it('unsaves on second call (returns { saved: false })', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId1}/save`,
        params: { id: routeId1 },
      })
      const result = await saveHandler(event)
      expect(result.saved).toBe(false)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId1}/save`,
        params: { id: routeId1 },
      })
      await expect(saveHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 404 for nonexistent route', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'POST',
        path: '/api/routes/nonexistent-xyz/save',
        params: { id: 'nonexistent-xyz' },
      })
      await expect(saveHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/my/saved-routes
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/my/saved-routes', () => {
    beforeAll(async () => {
      // Save both routes for the user
      mockUserSession(user)
      const e1 = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId1}/save`,
        params: { id: routeId1 },
      })
      await saveHandler(e1) // save routeId1

      const e2 = createMockEvent({
        method: 'POST',
        path: `/api/routes/${routeId2}/save`,
        params: { id: routeId2 },
      })
      await saveHandler(e2) // save routeId2
    })

    it('returns saved routes for authenticated user', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/my/saved-routes' })
      const result = await getSavedHandler(event)

      expect(result).toHaveProperty('routes')
      expect(result).toHaveProperty('total')
      expect(result.routes.length).toBeGreaterThanOrEqual(2)
    })

    it('includes isSaved=true for all returned routes', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/my/saved-routes' })
      const result = await getSavedHandler(event)

      for (const route of result.routes) {
        expect(route.isSaved).toBe(true)
      }
    })

    it('returns empty when no saved routes', async () => {
      const freshId = `${PREFIX}fresh-user`
      await createTestUser(freshId, 'USER')
      mockUserSession({ id: freshId, email: `${freshId}@test.com`, name: 'Fresh', role: 'USER' })

      const event = createMockEvent({ method: 'GET', path: '/api/my/saved-routes' })
      const result = await getSavedHandler(event)

      expect(result.routes).toEqual([])
      expect(result.total).toBe(0)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/my/saved-routes' })
      await expect(getSavedHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })
  })
})
