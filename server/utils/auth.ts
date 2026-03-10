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

/**
 * Require that the user is the owner of the resource OR is an admin.
 * Throws 401 if not logged in, 403 if not owner and not admin.
 */
export async function requireOwnerOrAdmin(
  event: H3Event,
  resourceOwnerId: string | null | undefined
): Promise<User> {
  const user = await requireAuth(event)
  if (user.role === 'ADMIN') return user
  if (resourceOwnerId && user.id === resourceOwnerId) return user
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden: You can only modify your own resources',
  })
}
