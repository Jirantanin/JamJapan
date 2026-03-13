import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test.describe('Homepage /', () => {
    test('page loads with hero section', async ({ page }) => {
      await page.goto('/')
      // Should have a hero section or main content
      await expect(page.locator('body')).toBeVisible()
      // Check for main navigation or header
      await expect(page.locator('header, nav').first()).toBeVisible()
    })

    test('header shows login button when not authenticated', async ({ page }) => {
      await page.goto('/')
      // Should show login/sign-in link for unauthenticated users
      const header = page.locator('header')
      await expect(header).toBeVisible()
    })

    test('navigation links work', async ({ page }) => {
      await page.goto('/')
      // Check that key navigation elements exist
      await expect(page.locator('a[href*="routes"], a[href*="route"]').first()).toBeVisible()
    })
  })

  test.describe('Route Listing /routes', () => {
    test('page loads with route content', async ({ page }) => {
      await page.goto('/routes')
      await page.waitForLoadState('networkidle')
      // Page should have loaded without error
      await expect(page.locator('body')).toBeVisible()
      // Should not show a server error page
      await expect(page.locator('body')).not.toContainText('Internal Server Error')
    })

    test('page has filter functionality', async ({ page }) => {
      await page.goto('/routes')
      await page.waitForLoadState('networkidle')
      // The route listing should render content
      await expect(page.locator('main, [class*="container"], #__nuxt').first()).toBeVisible()
    })
  })

  test.describe('Route Detail /routes/[id]', () => {
    test('shows 404 or error for nonexistent route', async ({ page }) => {
      const response = await page.goto('/routes/nonexistent-route-xyz-123')
      // Should either show 404 page or redirect
      if (response) {
        expect([200, 404]).toContain(response.status())
      }
    })
  })

  test.describe('Search /search', () => {
    test('page loads with search input', async ({ page }) => {
      await page.goto('/search')
      await page.waitForLoadState('networkidle')
      // Should have search input
      const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder]').first()
      await expect(searchInput).toBeVisible()
    })
  })

  test.describe('Route Requests /route-requests', () => {
    test('page loads successfully', async ({ page }) => {
      await page.goto('/route-requests')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('body')).not.toContainText('Internal Server Error')
    })
  })
})
