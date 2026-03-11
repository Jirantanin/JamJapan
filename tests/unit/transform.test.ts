import { describe, it, expect } from 'vitest'
import { transformRoute, transformReview, transformRouteRequest } from '../../server/utils/transform'

// Minimal mock Route matching Prisma Route shape
function mockPrismaRoute(overrides = {}) {
  return {
    id: 'test-route',
    title: 'Test Route',
    description: 'A test route',
    city: 'tokyo',
    difficulty: 'easy',
    estimatedMinutes: 15,
    distanceMeters: 1000,
    coverImage: null,
    startLat: 35.68,
    startLng: 139.70,
    startName: 'Shinjuku Station',
    endLat: 35.69,
    endLng: 139.71,
    endName: 'Golden Gai',
    tags: '["food","nightlife"]',
    status: 'published',
    source: 'official',
    averageRating: 4.5,
    reviewCount: 3,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    createdById: null,
    steps: [],
    createdBy: null,
    savedBy: [],
    ...overrides,
  } as any
}

describe('transformRoute', () => {
  it('transforms flat coordinates to nested Location objects', () => {
    const result = transformRoute(mockPrismaRoute())
    expect(result.start).toEqual({ lat: 35.68, lng: 139.70, name: 'Shinjuku Station' })
    expect(result.end).toEqual({ lat: 35.69, lng: 139.71, name: 'Golden Gai' })
  })

  it('parses JSON string tags to array', () => {
    const result = transformRoute(mockPrismaRoute({ tags: '["food","nightlife"]' }))
    expect(result.tags).toEqual(['food', 'nightlife'])
  })

  it('handles already-parsed tags array', () => {
    const result = transformRoute(mockPrismaRoute({ tags: ['food', 'nightlife'] as any }))
    expect(result.tags).toEqual(['food', 'nightlife'])
  })

  it('handles empty tags', () => {
    const result = transformRoute(mockPrismaRoute({ tags: '[]' }))
    expect(result.tags).toEqual([])
  })

  it('sorts steps by order', () => {
    const steps = [
      { order: 3, instruction: 'Step 3', locationLat: 1, locationLng: 1, locationName: null, image: null, distanceFromPrev: null, note: null },
      { order: 1, instruction: 'Step 1', locationLat: 1, locationLng: 1, locationName: null, image: null, distanceFromPrev: null, note: null },
      { order: 2, instruction: 'Step 2', locationLat: 1, locationLng: 1, locationName: null, image: null, distanceFromPrev: null, note: null },
    ]
    const result = transformRoute(mockPrismaRoute({ steps }))
    expect(result.steps[0].order).toBe(1)
    expect(result.steps[1].order).toBe(2)
    expect(result.steps[2].order).toBe(3)
  })

  it('transforms step location to nested object', () => {
    const steps = [
      { order: 1, instruction: 'Turn left', locationLat: 35.1, locationLng: 139.1, locationName: 'Corner', image: null, distanceFromPrev: 50, note: 'Careful' },
    ]
    const result = transformRoute(mockPrismaRoute({ steps }))
    expect(result.steps[0].location).toEqual({ lat: 35.1, lng: 139.1, name: 'Corner' })
    expect(result.steps[0].distanceFromPrev).toBe(50)
    expect(result.steps[0].note).toBe('Careful')
  })

  it('includes averageRating and reviewCount', () => {
    const result = transformRoute(mockPrismaRoute({ averageRating: 4.2, reviewCount: 7 }))
    expect(result.averageRating).toBe(4.2)
    expect(result.reviewCount).toBe(7)
  })

  it('sets isSaved=false when no currentUserId', () => {
    const result = transformRoute(mockPrismaRoute({ savedBy: [{ userId: 'user-1' }] }))
    expect(result.isSaved).toBe(false)
  })

  it('sets isSaved=true when currentUserId matches a savedBy entry', () => {
    const result = transformRoute(mockPrismaRoute({ savedBy: [{ userId: 'user-1' }] }), 'user-1')
    expect(result.isSaved).toBe(true)
  })

  it('sets isSaved=false when currentUserId does not match', () => {
    const result = transformRoute(mockPrismaRoute({ savedBy: [{ userId: 'user-1' }] }), 'user-2')
    expect(result.isSaved).toBe(false)
  })

  it('maps createdBy to simplified object', () => {
    const result = transformRoute(mockPrismaRoute({
      createdBy: { id: 'u1', name: 'Alice', avatar: 'https://avatar.url' },
    }))
    expect(result.createdBy).toEqual({ id: 'u1', name: 'Alice', avatar: 'https://avatar.url' })
  })

  it('sets createdBy to null when not present', () => {
    const result = transformRoute(mockPrismaRoute({ createdBy: null }))
    expect(result.createdBy).toBeNull()
  })
})

describe('transformReview', () => {
  it('maps user to createdBy', () => {
    const review = {
      id: 'r1',
      rating: 5,
      comment: 'Great!',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      user: { id: 'u1', name: 'Bob', avatar: null },
    }
    const result = transformReview(review)
    expect(result.id).toBe('r1')
    expect(result.rating).toBe(5)
    expect(result.comment).toBe('Great!')
    expect(result.createdBy).toEqual({ id: 'u1', name: 'Bob', avatar: null })
  })

  it('handles null user', () => {
    const result = transformReview({ id: 'r1', rating: 3, comment: null, createdAt: new Date(), updatedAt: new Date(), user: null })
    expect(result.createdBy).toBeNull()
  })
})

describe('transformRouteRequest', () => {
  const mockRequest = {
    id: 'req-1',
    title: 'New Route',
    description: 'Please add this',
    city: 'osaka',
    startPoint: 'Station A',
    endPoint: 'Station B',
    status: 'pending',
    voteCount: 5,
    fulfilledRouteId: null,
    createdAt: new Date('2025-01-01'),
    createdBy: { id: 'u1', name: 'Alice', avatar: null },
    votes: [],
  }

  it('returns hasVoted=false with no currentUserId', () => {
    const result = transformRouteRequest(mockRequest)
    expect(result.hasVoted).toBe(false)
  })

  it('returns hasVoted=true when user voted', () => {
    const result = transformRouteRequest(
      { ...mockRequest, votes: [{ userId: 'u1' }] },
      'u1'
    )
    expect(result.hasVoted).toBe(true)
  })

  it('returns hasVoted=false when user did not vote', () => {
    const result = transformRouteRequest(
      { ...mockRequest, votes: [{ userId: 'u2' }] },
      'u1'
    )
    expect(result.hasVoted).toBe(false)
  })

  it('maps createdBy correctly', () => {
    const result = transformRouteRequest(mockRequest)
    expect(result.createdBy).toEqual({ id: 'u1', name: 'Alice', avatar: null })
  })
})
