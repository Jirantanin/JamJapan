import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent } from '../helpers/setup'
import { createTestUser, createTestRoute, cleanupTestData } from '../helpers/db'

const PREFIX = 'rstatus-'

describe('PUT /api/routes/:id/status', () => {
  let handler: any

  const userId = `${PREFIX}user`
  const adminId = `${PREFIX}admin`
  const otherId = `${PREFIX}other`

  const user = { id: userId, email: `${userId}@test.com`, name: 'Status User', role: 'USER' as const }
  const admin = { id: adminId, email: `${adminId}@test.com`, name: 'Status Admin', role: 'ADMIN' as const }
  const other = { id: otherId, email: `${otherId}@test.com`, name: 'Other User', role: 'USER' as const }

  const draftRouteId = `${PREFIX}draft-route`
  const publishedRouteId = `${PREFIX}published-route`
  const adminRouteId = `${PREFIX}admin-route`

  beforeAll(async () => {
    await cleanupTestData(PREFIX)
    await createTestUser(userId, 'USER')
    await createTestUser(adminId, 'ADMIN')
    await createTestUser(otherId, 'USER')

    await createTestRoute(draftRouteId, userId, { status: 'draft' })
    await createTestRoute(publishedRouteId, userId, { status: 'published' })
    await createTestRoute(adminRouteId, adminId, { status: 'published' })

    handler = (await import('../../server/api/routes/[id]/status.put')).default
  })

  afterAll(async () => {
    mockAnonymous()
    await cleanupTestData(PREFIX)
  })

  it('ADMIN can change status to published', async () => {
    mockUserSession(admin)
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'published' },
    })
    const result = await handler(event)
    expect(result.status).toBe('published')
  })

  it('ADMIN can change status to unpublished', async () => {
    mockUserSession(admin)
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${publishedRouteId}/status`,
      params: { id: publishedRouteId },
      body: { status: 'unpublished' },
    })
    const result = await handler(event)
    expect(result.status).toBe('unpublished')
  })

  it('ADMIN can change status to draft', async () => {
    mockUserSession(admin)
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${publishedRouteId}/status`,
      params: { id: publishedRouteId },
      body: { status: 'draft' },
    })
    const result = await handler(event)
    expect(result.status).toBe('draft')
  })

  it('Owner can publish own draft route', async () => {
    // Reset to draft first
    mockUserSession(admin)
    let event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'draft' },
    })
    await handler(event)

    // Now user publishes own draft
    mockUserSession(user)
    event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'published' },
    })
    const result = await handler(event)
    expect(result.status).toBe('published')
  })

  it('returns 401 when not authenticated', async () => {
    mockAnonymous()
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'published' },
    })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('returns 403 when non-owner tries to change status', async () => {
    mockUserSession(other)
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'published' },
    })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
  })

  it('returns 403 when USER tries to unpublish', async () => {
    mockUserSession(user)
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'unpublished' },
    })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
  })

  it('returns 400 for invalid status value', async () => {
    mockUserSession(admin)
    const event = createMockEvent({
      method: 'PUT',
      path: `/api/routes/${draftRouteId}/status`,
      params: { id: draftRouteId },
      body: { status: 'invalid-status' },
    })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('returns 404 for nonexistent route', async () => {
    mockUserSession(admin)
    const event = createMockEvent({
      method: 'PUT',
      path: '/api/routes/nonexistent-xyz/status',
      params: { id: 'nonexistent-xyz' },
      body: { status: 'published' },
    })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})
