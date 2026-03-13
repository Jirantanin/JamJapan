import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockEvent } from '../helpers/setup'

describe('rate-limit middleware', () => {
  let handler: (event: any) => any

  beforeEach(async () => {
    // Reset modules to get a fresh Map store for each test
    vi.resetModules()
    const mod = await import('../../server/middleware/rate-limit')
    handler = mod.default
  })

  it('allows first request through without error', async () => {
    const event = createMockEvent({
      method: 'GET',
      path: '/api/routes',
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })

    // Should not throw
    expect(() => handler(event)).not.toThrow()
  })

  it('ignores non-API paths', () => {
    const event = createMockEvent({
      method: 'GET',
      path: '/about',
      headers: { 'x-forwarded-for': '10.0.0.2' },
    })

    // Should return undefined (early return) and not throw
    const result = handler(event)
    expect(result).toBeUndefined()
  })

  it('allows up to 120 GET requests per minute within limit', () => {
    for (let i = 0; i < 120; i++) {
      const event = createMockEvent({
        method: 'GET',
        path: '/api/routes',
        headers: { 'x-forwarded-for': '10.0.0.3' },
      })
      expect(() => handler(event)).not.toThrow()
    }
  })

  it('applies 10/min limit for POST /api/routes', () => {
    // First 10 should succeed
    for (let i = 0; i < 10; i++) {
      const event = createMockEvent({
        method: 'POST',
        path: '/api/routes',
        headers: { 'x-forwarded-for': '10.0.0.4' },
      })
      expect(() => handler(event)).not.toThrow()
    }

    // 11th should throw 429
    const event = createMockEvent({
      method: 'POST',
      path: '/api/routes',
      headers: { 'x-forwarded-for': '10.0.0.4' },
    })
    expect(() => handler(event)).toThrow()
    try {
      handler(event)
    } catch (e: any) {
      expect(e.statusCode).toBe(429)
    }
  })

  it('applies 30/min limit for vote endpoints', () => {
    // First 30 should succeed
    for (let i = 0; i < 30; i++) {
      const event = createMockEvent({
        method: 'POST',
        path: '/api/route-requests/test/vote',
        headers: { 'x-forwarded-for': '10.0.0.5' },
      })
      expect(() => handler(event)).not.toThrow()
    }

    // 31st should throw 429
    const event = createMockEvent({
      method: 'POST',
      path: '/api/route-requests/test/vote',
      headers: { 'x-forwarded-for': '10.0.0.5' },
    })
    expect(() => handler(event)).toThrow()
    try {
      handler(event)
    } catch (e: any) {
      expect(e.statusCode).toBe(429)
    }
  })

  it('applies 10/min limit for review endpoints', () => {
    // First 10 should succeed
    for (let i = 0; i < 10; i++) {
      const event = createMockEvent({
        method: 'POST',
        path: '/api/reviews',
        headers: { 'x-forwarded-for': '10.0.0.6' },
      })
      expect(() => handler(event)).not.toThrow()
    }

    // 11th should throw 429
    const event = createMockEvent({
      method: 'POST',
      path: '/api/reviews',
      headers: { 'x-forwarded-for': '10.0.0.6' },
    })
    expect(() => handler(event)).toThrow()
    try {
      handler(event)
    } catch (e: any) {
      expect(e.statusCode).toBe(429)
    }
  })

  it('blocks request exceeding limit with 429 status and Retry-After header', () => {
    // Use POST /api/routes (limit=10) for fastest test
    for (let i = 0; i < 10; i++) {
      const event = createMockEvent({
        method: 'POST',
        path: '/api/routes',
        headers: { 'x-forwarded-for': '10.0.0.7' },
      })
      handler(event)
    }

    // 11th request should be blocked
    const blockedEvent = createMockEvent({
      method: 'POST',
      path: '/api/routes',
      headers: { 'x-forwarded-for': '10.0.0.7' },
    })

    // Capture the response headers that were set
    const headersSet: Record<string, string> = {}
    const originalSetResponseHeaders = (globalThis as any).setResponseHeaders
    ;(globalThis as any).setResponseHeaders = (_event: any, headers: Record<string, string>) => {
      Object.assign(headersSet, headers)
    }

    try {
      handler(blockedEvent)
      // Should not reach here
      expect.fail('Expected handler to throw')
    } catch (e: any) {
      expect(e.statusCode).toBe(429)
      expect(e.statusMessage).toBe('Too Many Requests')
      expect(headersSet['Retry-After']).toBeDefined()
      expect(Number(headersSet['Retry-After'])).toBeGreaterThan(0)
      expect(headersSet['X-RateLimit-Remaining']).toBe('0')
    } finally {
      ;(globalThis as any).setResponseHeaders = originalSetResponseHeaders
    }
  })
})
