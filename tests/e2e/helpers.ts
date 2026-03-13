import { type Page } from '@playwright/test'

/**
 * Login as a test user via the dev-only test-login endpoint.
 * Sets session cookie so subsequent page visits are authenticated.
 */
export async function loginAs(
  page: Page,
  role: 'USER' | 'ADMIN' = 'USER',
  email?: string
) {
  const testEmail = email || `e2e-${role.toLowerCase()}@test.com`
  const response = await page.request.post('/api/auth/test-login', {
    data: {
      email: testEmail,
      role,
      name: `E2E ${role}`,
    },
  })

  if (!response.ok()) {
    throw new Error(`Test login failed: ${response.status()} ${await response.text()}`)
  }

  return response.json()
}

/**
 * Logout by clearing the session.
 */
export async function logout(page: Page) {
  // Navigate to clear cookies or call a logout endpoint
  await page.context().clearCookies()
}
