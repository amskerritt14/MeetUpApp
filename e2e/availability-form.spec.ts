import { test, expect } from '@playwright/test'

// These tests check the availability form UI in isolation using
// the event token page. Since Supabase is live in e2e, we cannot
// actually load a real event, so we test only what the dev server
// exposes without auth — primarily navigation and static structure.

test.describe('Availability form (token page structure)', () => {
  test('navigating to a fake token shows a page (not a crash)', async ({ page }) => {
    // The page may show an error/loading state — we just confirm it renders
    const response = await page.goto('/event/test-token-123')
    // Accept any non-5xx status (404 or 200 are both valid here)
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('Landing page form interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('submit button is present on landing (Log in)', async ({ page }) => {
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
  })

  test('page does not have any JS console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Filter out known non-critical errors (e.g. favicon 404)
    const criticalErrors = errors.filter(e => !e.includes('favicon'))
    expect(criticalErrors).toHaveLength(0)
  })
})
