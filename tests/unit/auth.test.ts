import { describe, it, expect, beforeEach } from 'vitest'
import { mockUserSession, mockAnonymous, createMockEvent, TEST_USER, TEST_ADMIN } from '../helpers/setup'
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from '../../server/utils/auth'

describe('requireAuth', () => {
  beforeEach(() => {
    mockAnonymous()
  })

  it('returns user when session has valid user', async () => {
    mockUserSession(TEST_USER)
    const event = createMockEvent()

    const user = await requireAuth(event)

    expect(user).toMatchObject({
      id: TEST_USER.id,
      email: TEST_USER.email,
      name: TEST_USER.name,
      role: 'USER',
    })
  })

  it('throws 401 when anonymous (no session)', async () => {
    mockAnonymous()
    const event = createMockEvent()

    await expect(requireAuth(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 401 when session.user is null', async () => {
    // Simulate session existing but user being null
    const g = globalThis as any
    const original = g.getUserSession
    g.getUserSession = async () => ({ user: null })

    const event = createMockEvent()
    await expect(requireAuth(event)).rejects.toMatchObject({ statusCode: 401 })

    g.getUserSession = original
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    mockAnonymous()
  })

  it('returns user when role is ADMIN', async () => {
    mockUserSession(TEST_ADMIN)
    const event = createMockEvent()

    const user = await requireAdmin(event)

    expect(user).toMatchObject({
      id: TEST_ADMIN.id,
      role: 'ADMIN',
    })
  })

  it('throws 401 when not authenticated', async () => {
    mockAnonymous()
    const event = createMockEvent()

    await expect(requireAdmin(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 403 when role is USER', async () => {
    mockUserSession(TEST_USER)
    const event = createMockEvent()

    await expect(requireAdmin(event)).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('requireOwnerOrAdmin', () => {
  beforeEach(() => {
    mockAnonymous()
  })

  it('allows resource owner', async () => {
    mockUserSession(TEST_USER)
    const event = createMockEvent()

    const user = await requireOwnerOrAdmin(event, TEST_USER.id)

    expect(user).toMatchObject({
      id: TEST_USER.id,
      role: 'USER',
    })
  })

  it('allows ADMIN to modify any resource', async () => {
    mockUserSession(TEST_ADMIN)
    const event = createMockEvent()

    const user = await requireOwnerOrAdmin(event, 'some-other-user-id')

    expect(user).toMatchObject({
      id: TEST_ADMIN.id,
      role: 'ADMIN',
    })
  })

  it('throws 403 when non-owner and non-admin', async () => {
    mockUserSession(TEST_USER)
    const event = createMockEvent()

    await expect(
      requireOwnerOrAdmin(event, 'different-user-id')
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})
