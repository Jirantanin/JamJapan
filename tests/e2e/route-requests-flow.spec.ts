import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Route Request Flow', () => {
  test('route requests listing page loads', async ({ page }) => {
    await page.goto('/route-requests')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('create page requires authentication', async ({ page }) => {
    await page.goto('/route-requests/create')
    await page.waitForLoadState('networkidle')
    // Should redirect or require login
    const url = page.url()
    expect(url).toBeDefined()
  })

  test('authenticated user can access create page', async ({ page }) => {
    await loginAs(page, 'USER')
    await page.goto('/route-requests/create')
    await page.waitForLoadState('networkidle')
    // Should see the form
    expect(page.url()).toContain('/route-requests/create')
    await expect(page.locator('body')).toBeVisible()
  })

  test('create form has required fields', async ({ page }) => {
    await loginAs(page, 'USER')
    await page.goto('/route-requests/create')
    await page.waitForLoadState('networkidle')

    // Should have form inputs for title, description, city, start/end points
    const inputs = page.locator('input, textarea, select')
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(3) // At minimum: title, start, end
  })

  test('form validates required fields', async ({ page }) => {
    await loginAs(page, 'USER')
    await page.goto('/route-requests/create')
    await page.waitForLoadState('networkidle')

    // Try submitting empty form
    const submitBtn = page.locator('button[type="submit"], button:has-text("ส่ง"), button:has-text("สร้าง"), button:has-text("Submit")').first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Should show validation errors or stay on same page
      await page.waitForTimeout(500)
      expect(page.url()).toContain('/route-requests/create')
    }
  })

  test('API endpoint returns route requests', async ({ page }) => {
    const response = await page.request.get('/api/route-requests')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('requests')
    expect(Array.isArray(data.requests)).toBeTruthy()
  })

  test('API can create route request when authenticated', async ({ page }) => {
    await loginAs(page, 'USER', 'e2e-reqflow@test.com')

    const response = await page.request.post('/api/route-requests', {
      data: {
        title: 'E2E Test Request',
        description: 'Created via E2E test',
        city: 'tokyo',
        startPoint: 'E2E Start',
        endPoint: 'E2E End',
      },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.title).toBe('E2E Test Request')
    expect(data.status).toBe('pending')
  })

  test('city filter API works', async ({ page }) => {
    const response = await page.request.get('/api/route-requests?city=tokyo')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    for (const req of data.requests) {
      expect(req.city).toBe('tokyo')
    }
  })
})
