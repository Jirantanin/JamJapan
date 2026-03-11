const store = new Map<string, { count: number; windowStart: number }>()

// Cleanup every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 60_000) store.delete(key)
  }
}, 5 * 60_000)

function getLimit(method: string, path: string): number {
  if (method === 'GET') return 120 // 120 req/min for GET
  if (path.includes('/vote')) return 30
  if (path.includes('/save')) return 30
  if (path.includes('/api/routes') && method === 'POST') return 10
  if (path.includes('/api/route-requests') && method === 'POST') return 10
  if (path.includes('/api/reviews') || path.includes('/reviews')) return 10
  return 30 // default for other writes
}

export default defineEventHandler((event) => {
  const method = event.method
  const path = event.path

  // Only rate limit API routes
  if (!path.startsWith('/api/')) return

  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  const key = `${ip}:${method}:${path.split('/').slice(0, 4).join('/')}`
  const now = Date.now()
  const windowMs = 60_000

  const entry = store.get(key)
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return
  }

  entry.count++
  const limit = getLimit(method, path)

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000)
    setResponseHeaders(event, {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil((entry.windowStart + windowMs) / 1000)),
    })
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  setResponseHeaders(event, {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(limit - entry.count),
  })
})
