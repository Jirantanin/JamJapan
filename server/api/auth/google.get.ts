import { getPrisma } from '../../utils/prisma'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    const prisma = await getPrisma()

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: googleUser.sub,
        },
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          provider: 'google',
          providerId: googleUser.sub,
        },
      })
    } else {
      // Update profile info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: googleUser.name,
          avatar: googleUser.picture,
        },
      })
    }

    // Auto-assign admin role by email
    const adminEmails = (process.env.NUXT_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)

    if (adminEmails.includes(user.email.toLowerCase()) && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      })
    }

    // Set session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    })

    return sendRedirect(event, '/')
  },
})
