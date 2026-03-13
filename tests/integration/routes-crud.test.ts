import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRoute, cleanupTestData } from '../helpers/db'
import getPrisma from '../../server/utils/prisma'

const PREFIX = 'rcrud-'

describe('Routes CRUD API Handlers', () => {
  let prisma: any

  // Handlers (dynamically imported)
  let getListHandler: any
  let postHandler: any
  let getOneHandler: any
  let putHandler: any
  let deleteHandler: any

  // Test users
  const userId = `${PREFIX}user`
  const adminId = `${PREFIX}admin`
  const user = { id: userId, email: `${userId}@test.com`, name: 'RCRUD User', role: 'USER' as const }
  const admin = { id: adminId, email: `${adminId}@test.com`, name: 'RCRUD Admin', role: 'ADMIN' as const }

  // Pre-created route IDs
  const publishedRouteId = `${PREFIX}published`
  const draftRouteId = `${PREFIX}draft`
  const userRouteId = `${PREFIX}user-owned`
  const osakaRouteId = `${PREFIX}osaka-route`

  beforeAll(async () => {
    prisma = await getPrisma()
    await cleanupTestData(PREFIX)

    // Create test users
    await createTestUser(userId, 'USER')
    await createTestUser(adminId, 'ADMIN')

    // Create test routes
    await createTestRoute(publishedRouteId, null, { status: 'published', city: 'tokyo', difficulty: 'easy' })
    await createTestRoute(draftRouteId, userId, { status: 'draft', source: 'community' })
    await createTestRoute(userRouteId, userId, { status: 'published', source: 'community' })
    await createTestRoute(osakaRouteId, null, { status: 'published', city: 'osaka', difficulty: 'hard' })

    // Save a route for the user (for isSaved tests)
    await prisma.savedRoute.create({ data: { routeId: publishedRouteId, userId } })

    // Import handlers
    getListHandler = (await import('../../server/api/routes/index.get')).default
    postHandler = (await import('../../server/api/routes/index.post')).default
    getOneHandler = (await import('../../server/api/routes/[id].get')).default
    putHandler = (await import('../../server/api/routes/[id].put')).default
    deleteHandler = (await import('../../server/api/routes/[id].delete')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/routes — List routes
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/routes', () => {
    it('returns paginated list of published routes', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/routes' })
      const result = await getListHandler(event)

      expect(result).toHaveProperty('routes')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('limit')
      expect(Array.isArray(result.routes)).toBe(true)
      // All returned routes should be published
      for (const route of result.routes) {
        expect(route.status).toBe('published')
      }
    })

    it('filters by city query param', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/routes', query: { city: 'osaka' } })
      const result = await getListHandler(event)

      expect(result.routes.length).toBeGreaterThanOrEqual(1)
      for (const route of result.routes) {
        expect(route.city).toBe('osaka')
      }
    })

    it('filters by difficulty query param', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/routes', query: { difficulty: 'hard' } })
      const result = await getListHandler(event)

      expect(result.routes.length).toBeGreaterThanOrEqual(1)
      for (const route of result.routes) {
        expect(route.difficulty).toBe('hard')
      }
    })

    it('supports text search via q parameter', async () => {
      mockAnonymous()
      // Search for osaka route by its city name
      const event = createMockEvent({ method: 'GET', path: '/api/routes', query: { q: 'osaka' } })
      const result = await getListHandler(event)

      expect(result.routes.length).toBeGreaterThanOrEqual(1)
    })

    it('returns isSaved=true for authenticated user who saved route', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: '/api/routes' })
      const result = await getListHandler(event)

      const savedRoute = result.routes.find((r: any) => r.id === publishedRouteId)
      expect(savedRoute).toBeDefined()
      expect(savedRoute.isSaved).toBe(true)
    })

    it('returns isSaved=false for anonymous user', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/routes' })
      const result = await getListHandler(event)

      for (const route of result.routes) {
        expect(route.isSaved).toBe(false)
      }
    })
  })

  // ──────────────────────────────────────────────────────────────
  // POST /api/routes — Create route
  // ──────────────────────────────────────────────────────────────
  describe('POST /api/routes', () => {
    const validRouteBody = {
      id: `${PREFIX}test-route-new`,
      title: 'Test New Route',
      description: 'A test route for CRUD tests',
      city: 'tokyo',
      difficulty: 'easy',
      estimatedMinutes: 15,
      distanceMeters: 500,
      start: { lat: 35.68, lng: 139.70, name: 'Start' },
      end: { lat: 35.69, lng: 139.71, name: 'End' },
      tags: ['test'],
      steps: [{ order: 1, instruction: 'Walk forward', location: { lat: 35.685, lng: 139.705, name: 'Mid' } }],
    }

    afterAll(async () => {
      // Clean up routes created in this describe block
      await prisma.step.deleteMany({ where: { routeId: { startsWith: `${PREFIX}test-route` } } })
      await prisma.route.deleteMany({ where: { id: { startsWith: `${PREFIX}test-route` } } })
    })

    it('creates route when ADMIN (status=published, source=official)', async () => {
      mockUserSession(admin)
      const body = { ...validRouteBody, id: `${PREFIX}test-route-admin` }
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body })
      const result = await postHandler(event)

      expect(result.id).toBe(`${PREFIX}test-route-admin`)
      expect(result.status).toBe('published')
      expect(result.source).toBe('official')
      expect(result.title).toBe('Test New Route')
    })

    it('creates route when USER (status=draft, source=community)', async () => {
      mockUserSession(user)
      const body = { ...validRouteBody, id: `${PREFIX}test-route-user` }
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body })
      const result = await postHandler(event)

      expect(result.id).toBe(`${PREFIX}test-route-user`)
      expect(result.status).toBe('draft')
      expect(result.source).toBe('community')
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body: validRouteBody })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 400 for invalid body (missing required fields)', async () => {
      mockUserSession(admin)
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body: { title: 'Missing fields' } })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 400 for non-kebab-case id', async () => {
      mockUserSession(admin)
      const body = { ...validRouteBody, id: 'Bad ID With Spaces' }
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 400 for empty steps array', async () => {
      mockUserSession(admin)
      const body = { ...validRouteBody, id: `${PREFIX}test-route-empty-steps`, steps: [] }
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('returns 409 when route id already exists', async () => {
      mockUserSession(admin)
      // publishedRouteId was already created in beforeAll
      const body = { ...validRouteBody, id: publishedRouteId }
      const event = createMockEvent({ method: 'POST', path: '/api/routes', body })
      await expect(postHandler(event)).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // GET /api/routes/:id — Get single route
  // ──────────────────────────────────────────────────────────────
  describe('GET /api/routes/:id', () => {
    it('returns single route with steps for published route', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: `/api/routes/${publishedRouteId}`, params: { id: publishedRouteId } })
      const result = await getOneHandler(event)

      expect(result.id).toBe(publishedRouteId)
      expect(result.steps).toBeDefined()
      expect(Array.isArray(result.steps)).toBe(true)
      expect(result.steps.length).toBeGreaterThanOrEqual(1)
    })

    it('returns 404 for nonexistent route', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: '/api/routes/nonexistent-route-xyz', params: { id: 'nonexistent-route-xyz' } })
      await expect(getOneHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('hides draft route from anonymous users (404)', async () => {
      mockAnonymous()
      const event = createMockEvent({ method: 'GET', path: `/api/routes/${draftRouteId}`, params: { id: draftRouteId } })
      await expect(getOneHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('shows draft route to its creator', async () => {
      mockUserSession(user)
      const event = createMockEvent({ method: 'GET', path: `/api/routes/${draftRouteId}`, params: { id: draftRouteId } })
      const result = await getOneHandler(event)

      expect(result.id).toBe(draftRouteId)
      expect(result.status).toBe('draft')
    })

    it('shows draft route to ADMIN', async () => {
      mockUserSession(admin)
      const event = createMockEvent({ method: 'GET', path: `/api/routes/${draftRouteId}`, params: { id: draftRouteId } })
      const result = await getOneHandler(event)

      expect(result.id).toBe(draftRouteId)
      expect(result.status).toBe('draft')
    })
  })

  // ──────────────────────────────────────────────────────────────
  // PUT /api/routes/:id — Update route
  // ──────────────────────────────────────────────────────────────
  describe('PUT /api/routes/:id', () => {
    it('allows owner to update their route', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/routes/${userRouteId}`,
        params: { id: userRouteId },
        body: { title: 'Updated Title by Owner' },
      })
      const result = await putHandler(event)

      expect(result.id).toBe(userRouteId)
      expect(result.title).toBe('Updated Title by Owner')
    })

    it('allows ADMIN to update any route', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/routes/${userRouteId}`,
        params: { id: userRouteId },
        body: { title: 'Updated by Admin' },
      })
      const result = await putHandler(event)

      expect(result.id).toBe(userRouteId)
      expect(result.title).toBe('Updated by Admin')
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'PUT',
        path: `/api/routes/${userRouteId}`,
        params: { id: userRouteId },
        body: { title: 'Should fail' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 when non-owner non-admin', async () => {
      // Create another user who is not the owner
      const otherId = `${PREFIX}other-user`
      await createTestUser(otherId, 'USER')
      mockUserSession({ id: otherId, email: `${otherId}@test.com`, name: 'Other User', role: 'USER' })

      const event = createMockEvent({
        method: 'PUT',
        path: `/api/routes/${userRouteId}`,
        params: { id: userRouteId },
        body: { title: 'Should not work' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })

    it('returns 404 for nonexistent route', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'PUT',
        path: '/api/routes/nonexistent-xyz',
        params: { id: 'nonexistent-xyz' },
        body: { title: 'No route' },
      })
      await expect(putHandler(event)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  // ──────────────────────────────────────────────────────────────
  // DELETE /api/routes/:id — Delete route
  // ──────────────────────────────────────────────────────────────
  describe('DELETE /api/routes/:id', () => {
    const deleteRouteOwner = `${PREFIX}del-owner`
    const deleteRouteAdmin = `${PREFIX}del-admin`

    beforeAll(async () => {
      await createTestRoute(deleteRouteOwner, userId, { status: 'published' })
      await createTestRoute(deleteRouteAdmin, userId, { status: 'published' })
    })

    it('allows owner to delete their route', async () => {
      mockUserSession(user)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/routes/${deleteRouteOwner}`,
        params: { id: deleteRouteOwner },
      })
      const result = await deleteHandler(event)

      expect(result.success).toBe(true)
      // Verify actually deleted
      const found = await prisma.route.findUnique({ where: { id: deleteRouteOwner } })
      expect(found).toBeNull()
    })

    it('allows ADMIN to delete any route', async () => {
      mockUserSession(admin)
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/routes/${deleteRouteAdmin}`,
        params: { id: deleteRouteAdmin },
      })
      const result = await deleteHandler(event)

      expect(result.success).toBe(true)
    })

    it('returns 401 when not authenticated', async () => {
      mockAnonymous()
      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/routes/${userRouteId}`,
        params: { id: userRouteId },
      })
      await expect(deleteHandler(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns 403 for non-owner non-admin', async () => {
      const otherId = `${PREFIX}other-user`
      mockUserSession({ id: otherId, email: `${otherId}@test.com`, name: 'Other', role: 'USER' })

      const event = createMockEvent({
        method: 'DELETE',
        path: `/api/routes/${userRouteId}`,
        params: { id: userRouteId },
      })
      await expect(deleteHandler(event)).rejects.toMatchObject({ statusCode: 403 })
    })
  })
})
