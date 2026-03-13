/**
 * Global test setup — Injects Nitro auto-imports into globalThis
 * so that server handlers can be imported and invoked in Vitest.
 *
 * This file runs BEFORE all test files via vitest.config.ts setupFiles.
 */

import * as h3 from 'h3'
import { IncomingMessage, ServerResponse } from 'http'
import { Socket } from 'net'

// ─── 1. Inject h3 auto-imports into globalThis ─────────────────

const g = globalThis as any

// Core h3 functions used by server handlers
g.defineEventHandler = h3.defineEventHandler
g.createError = h3.createError
g.getQuery = h3.getQuery
g.getRouterParam = h3.getRouterParam
g.getHeader = h3.getHeader
g.setResponseHeaders = h3.setResponseHeaders
g.setResponseStatus = h3.setResponseStatus
g.getResponseStatus = h3.getResponseStatus
g.sendRedirect = h3.sendRedirect
g.getRequestURL = h3.getRequestURL
g.isError = h3.isError
g.eventHandler = h3.eventHandler
g.createEvent = h3.createEvent

// defineRouteMeta — no-op (used only for OpenAPI metadata)
g.defineRouteMeta = () => {}

// defineOAuthGoogleEventHandler — no-op (for auth handler)
g.defineOAuthGoogleEventHandler = (opts: any) =>
  h3.defineEventHandler(() => ({ message: 'OAuth mock' }))

// ─── 2. Override readBody to support mock bodies ────────────────

g.readBody = async (event: any) => {
  // Check if we set a mock body on the event
  if (event._requestBody !== undefined) return event._requestBody
  // Fallback to h3's readBody (won't work without real stream)
  try {
    return await h3.readBody(event)
  } catch {
    return undefined
  }
}

// ─── 3. Mock getUserSession / setUserSession ────────────────────

let _mockSession: any = null

g.getUserSession = async (_event: any) => {
  if (_mockSession === null) return {}
  return _mockSession
}

g.setUserSession = async (_event: any, _session: any) => {
  // no-op in tests
}

// ─── 4. Auth mock helper functions (exported) ───────────────────

export interface MockUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  avatar?: string | null
}

/**
 * Set mock session to simulate an authenticated user.
 * All subsequent handler calls will see this user.
 */
export function mockUserSession(user: MockUser) {
  _mockSession = { user }
}

/**
 * Clear mock session — simulates anonymous/unauthenticated request.
 */
export function mockAnonymous() {
  _mockSession = null
}

// ─── 5. Pre-defined test users ──────────────────────────────────

export const TEST_USER: MockUser = {
  id: 'test-user-handler',
  email: 'testhandler@example.com',
  name: 'Test Handler User',
  role: 'USER',
  avatar: null,
}

export const TEST_ADMIN: MockUser = {
  id: 'test-admin-handler',
  email: 'testadmin@example.com',
  name: 'Test Admin User',
  role: 'ADMIN',
  avatar: null,
}

// ─── 6. Mock H3 Event creator ───────────────────────────────────

export interface MockEventOptions {
  method?: string
  path?: string
  query?: Record<string, string>
  body?: any
  params?: Record<string, string>
  headers?: Record<string, string>
}

/**
 * Create a mock H3 event for testing handlers directly.
 */
export function createMockEvent(options: MockEventOptions = {}) {
  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.method = options.method || 'GET'

  // Build URL with query params
  const queryStr = options.query
    ? '?' + new URLSearchParams(options.query).toString()
    : ''
  req.url = (options.path || '/') + queryStr

  // Set headers
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      req.headers[key.toLowerCase()] = value
    }
  }

  const res = new ServerResponse(req)
  const event = h3.createEvent(req, res)

  // Set router params (for [id] style routes)
  if (options.params) {
    event.context.params = options.params
  }

  // Set mock body (for POST/PUT handlers)
  if (options.body !== undefined) {
    ;(event as any)._requestBody = options.body
  }

  return event
}
