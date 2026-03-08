import type { H3Event } from 'h3'
import type { User } from '#auth-utils'

/**
 * Require authenticated user. Throws 401 if not logged in.
 */
export async function requireAuth(event: H3Event): Promise<User> {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return session.user as User
}

/**
 * Require admin user. Throws 401 if not logged in, 403 if not admin.
 */
export async function requireAdmin(event: H3Event): Promise<User> {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required',
    })
  }

  return user
}
