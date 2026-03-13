import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Admin Flow', () => {
  test('admin can access /admin', async ({ page }) => {
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    // Should stay on admin page
    expect(page.url()).toContain('/admin')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('admin stats API returns data', async ({ page }) => {
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')

    const response = await page.request.get('/api/admin/stats')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('totalRoutes')
    expect(data).toHaveProperty('byCity')
    expect(data).toHaveProperty('byDifficulty')
    expect(data).toHaveProperty('totalRequests')
    expect(data).toHaveProperty('pendingRequests')
  })

  test('admin can access /admin/routes', async ({ page }) => {
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')
    await page.goto('/admin/routes')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/routes')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin can access /admin/route-requests', async ({ page }) => {
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')
    await page.goto('/admin/route-requests')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/route-requests')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin route requests API returns data', async ({ page }) => {
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')

    const response = await page.request.get('/api/admin/route-requests')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('requests')
    expect(data).toHaveProperty('total')
  })

  test('admin can change request status via API', async ({ page }) => {
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')

    // Create a test request first
    await loginAs(page, 'USER', 'e2e-admin-test-user@test.com')
    const createRes = await page.request.post('/api/route-requests', {
      data: {
        title: 'E2E Admin Status Test',
        description: 'Testing admin status change',
        city: 'osaka',
        startPoint: 'A',
        endPoint: 'B',
      },
    })
    const createdReq = await createRes.json()

    // Re-login as admin
    await loginAs(page, 'ADMIN', 'e2e-admin@test.com')

    // Change status to fulfilled
    const statusRes = await page.request.put(`/api/admin/route-requests/${createdReq.id}/status`, {
      data: { status: 'fulfilled' },
    })
    expect(statusRes.ok()).toBeTruthy()
    const updated = await statusRes.json()
    expect(updated.status).toBe('fulfilled')
  })

  test('admin stats API returns 403 for regular user', async ({ page }) => {
    await loginAs(page, 'USER', 'e2e-nonadmin@test.com')

    const response = await page.request.get('/api/admin/stats', {
      failOnStatusCode: false,
    })
    expect(response.status()).toBe(403)
  })

  test('admin stats API returns 401 for anonymous', async ({ page }) => {
    const response = await page.request.get('/api/admin/stats', {
      failOnStatusCode: false,
    })
    expect(response.status()).toBe(401)
  })
})
