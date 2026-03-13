import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Saved Routes Flow', () => {
  test('save API toggle works', async ({ page }) => {
    await loginAs(page, 'USER', 'e2e-save@test.com')

    // First get a route ID from the routes API
    const routesRes = await page.request.get('/api/routes')
    const routesData = await routesRes.json()

    if (routesData.routes.length === 0) {
      test.skip()
      return
    }

    const routeId = routesData.routes[0].id

    // Save the route
    const saveRes = await page.request.post(`/api/routes/${routeId}/save`)
    expect(saveRes.ok()).toBeTruthy()
    const saveData = await saveRes.json()
    expect(saveData.saved).toBe(true)

    // Unsave the route
    const unsaveRes = await page.request.post(`/api/routes/${routeId}/save`)
    expect(unsaveRes.ok()).toBeTruthy()
    const unsaveData = await unsaveRes.json()
    expect(unsaveData.saved).toBe(false)
  })

  test('/my/saved page loads for authenticated user', async ({ page }) => {
    await loginAs(page, 'USER', 'e2e-save@test.com')
    await page.goto('/my/saved')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/my/saved')
    await expect(page.locator('body')).toBeVisible()
  })

  test('saved routes API returns list', async ({ page }) => {
    await loginAs(page, 'USER', 'e2e-save@test.com')

    const response = await page.request.get('/api/my/saved-routes')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('routes')
    expect(Array.isArray(data.routes)).toBeTruthy()
  })

  test('save endpoint returns 401 for anonymous', async ({ page }) => {
    const response = await page.request.post('/api/routes/some-route-id/save', {
      failOnStatusCode: false,
    })
    expect(response.status()).toBe(401)
  })

  test('saved routes API returns 401 for anonymous', async ({ page }) => {
    const response = await page.request.get('/api/my/saved-routes', {
      failOnStatusCode: false,
    })
    expect(response.status()).toBe(401)
  })

  test('bookmark persists after save-unsave cycle', async ({ page }) => {
    await loginAs(page, 'USER', 'e2e-save-persist@test.com')

    // Get routes
    const routesRes = await page.request.get('/api/routes')
    const routesData = await routesRes.json()
    if (routesData.routes.length === 0) {
      test.skip()
      return
    }

    const routeId = routesData.routes[0].id

    // Save
    await page.request.post(`/api/routes/${routeId}/save`)

    // Verify isSaved via routes API
    const listRes = await page.request.get('/api/routes')
    const listData = await listRes.json()
    const savedRoute = listData.routes.find((r: any) => r.id === routeId)
    expect(savedRoute.isSaved).toBe(true)

    // Verify it appears in saved routes
    const savedRes = await page.request.get('/api/my/saved-routes')
    const savedData = await savedRes.json()
    const found = savedData.routes.find((r: any) => r.id === routeId)
    expect(found).toBeDefined()

    // Cleanup: unsave
    await page.request.post(`/api/routes/${routeId}/save`)
  })
})
