import { describe, it, expect } from 'vitest'
import {
  createRouteSchema,
  createRouteRequestSchema,
  createReviewSchema,
  updateReviewSchema,
} from '../../server/utils/validate'

const validStep = {
  order: 1,
  instruction: 'Turn left at the corner',
  location: { lat: 35.68, lng: 139.70 },
}

const validRoute = {
  id: 'shinjuku-to-golden-gai',
  title: 'Shinjuku to Golden Gai',
  description: 'A fun walk',
  city: 'tokyo',
  difficulty: 'easy',
  estimatedMinutes: 12,
  distanceMeters: 800,
  start: { lat: 35.68, lng: 139.70, name: 'Shinjuku Station' },
  end: { lat: 35.69, lng: 139.71, name: 'Golden Gai' },
  tags: ['food', 'nightlife'],
  steps: [validStep],
}

describe('createRouteSchema', () => {
  it('accepts valid route data', () => {
    const result = createRouteSchema.safeParse(validRoute)
    expect(result.success).toBe(true)
  })

  it('rejects non-kebab-case id', () => {
    const result = createRouteSchema.safeParse({ ...validRoute, id: 'Shinjuku Route!' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('id')
  })

  it('rejects unknown city', () => {
    const result = createRouteSchema.safeParse({ ...validRoute, city: 'paris' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown difficulty', () => {
    const result = createRouteSchema.safeParse({ ...validRoute, difficulty: 'extreme' })
    expect(result.success).toBe(false)
  })

  it('rejects empty steps array', () => {
    const result = createRouteSchema.safeParse({ ...validRoute, steps: [] })
    expect(result.success).toBe(false)
  })

  it('rejects negative estimatedMinutes', () => {
    const result = createRouteSchema.safeParse({ ...validRoute, estimatedMinutes: -1 })
    expect(result.success).toBe(false)
  })

  it('defaults tags to [] when not provided', () => {
    const { tags: _, ...routeWithoutTags } = validRoute
    const result = createRouteSchema.safeParse(routeWithoutTags)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.tags).toEqual([])
  })

  it('accepts all valid cities', () => {
    const cities = ['tokyo', 'osaka', 'kyoto', 'nara', 'fukuoka', 'sapporo', 'hiroshima', 'other']
    for (const city of cities) {
      const result = createRouteSchema.safeParse({ ...validRoute, city })
      expect(result.success).toBe(true)
    }
  })
})

describe('createRouteRequestSchema', () => {
  const validRequest = {
    title: 'Route from A to B',
    description: 'Please add this walking route',
    city: 'osaka',
    startPoint: 'Osaka Station',
    endPoint: 'Dotonbori',
  }

  it('accepts valid request data', () => {
    const result = createRouteRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = createRouteRequestSchema.safeParse({ ...validRequest, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects description over 1000 chars', () => {
    const result = createRouteRequestSchema.safeParse({ ...validRequest, description: 'a'.repeat(1001) })
    expect(result.success).toBe(false)
  })

  it('rejects missing startPoint', () => {
    const { startPoint: _, ...rest } = validRequest
    const result = createRouteRequestSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})

describe('createReviewSchema', () => {
  it('accepts rating 1-5 without comment', () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      const result = createReviewSchema.safeParse({ rating })
      expect(result.success).toBe(true)
    }
  })

  it('accepts rating with optional comment', () => {
    const result = createReviewSchema.safeParse({ rating: 4, comment: 'Great walk!' })
    expect(result.success).toBe(true)
  })

  it('rejects rating 0', () => {
    const result = createReviewSchema.safeParse({ rating: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects rating 6', () => {
    const result = createReviewSchema.safeParse({ rating: 6 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer rating', () => {
    const result = createReviewSchema.safeParse({ rating: 3.5 })
    expect(result.success).toBe(false)
  })

  it('rejects comment over 1000 chars', () => {
    const result = createReviewSchema.safeParse({ rating: 3, comment: 'a'.repeat(1001) })
    expect(result.success).toBe(false)
  })
})

describe('updateReviewSchema', () => {
  it('accepts partial update with just rating', () => {
    const result = updateReviewSchema.safeParse({ rating: 3 })
    expect(result.success).toBe(true)
  })

  it('accepts partial update with just comment', () => {
    const result = updateReviewSchema.safeParse({ comment: 'Updated review' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (no-op update)', () => {
    const result = updateReviewSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
