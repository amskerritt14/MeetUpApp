import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page title is "See You Next Tuesday?"', async ({ page }) => {
    await expect(page).toHaveTitle(/See You Next Tuesday\?/i)
  })

  test('"Log in" button is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
  })

  test('"Create an account" button is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /create an account/i })).toBeVisible()
  })

  test('clicking "Create an account" navigates to /signup', async ({ page }) => {
    await page.getByRole('link', { name: /create an account/i }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('clicking "Log in" navigates to /login', async ({ page }) => {
    await page.getByRole('link', { name: /log in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('main heading text is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /See You Next Tuesday\?/i })).toBeVisible()
  })
})
