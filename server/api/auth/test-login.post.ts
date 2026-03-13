/**
 * Dev-only auth bypass endpoint for E2E tests.
 * Creates or finds a user, then sets the session.
 * ONLY works when NODE_ENV=development.
 */
import getPrisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // Security guard: only allow in development
  if (process.env.NODE_ENV !== 'development') {
    throw createError({ statusCode: 403, statusMessage: 'Test login is only available in development' })
  }

  const body = await readBody(event)
  const email = body?.email as string
  const role = (body?.role as string) || 'USER'
  const name = body?.name || email?.split('@')[0] || 'E2E Test User'

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const prisma = await getPrisma()

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: { role, name },
    create: {
      email,
      name,
      role,
      provider: 'test',
      providerId: `test-${email}`,
    },
  })

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'ADMIN',
      avatar: user.avatar,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
})
