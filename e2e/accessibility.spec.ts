import { test, expect } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

test.describe('Accessibility checks', () => {
  test('landing page has no critical a11y violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)
    // checkA11y throws if violations found at critical/serious level
    await checkA11y(page, undefined, {
      axeOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
      includedImpacts: ['critical', 'serious'],
    })
  })

  test('login page has no critical a11y violations', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)
    await checkA11y(page, undefined, {
      axeOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
      includedImpacts: ['critical', 'serious'],
    })
  })

  test('signup page has no critical a11y violations', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)
    await checkA11y(page, undefined, {
      axeOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
      includedImpacts: ['critical', 'serious'],
    })
  })
})
