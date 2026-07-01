import { test, expect } from '@playwright/test'

test.describe('Signup page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('shows first name, email, and password fields', async ({ page }) => {
    await expect(page.getByPlaceholder(/alex/i)).toBeVisible()
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible()
    await expect(page.getByPlaceholder(/••••••••/)).toBeVisible()
  })

  test('has a "Create account" submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('empty submit shows browser/HTML5 required validation', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()
    // HTML5 required validation prevents submission; form should not navigate away
    await expect(page).toHaveURL('/signup')
  })
})

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('shows email and password fields', async ({ page }) => {
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible()
    await expect(page.getByPlaceholder(/••••••••/)).toBeVisible()
  })

  test('"Send magic link" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible()
  })

  test('shows error message when email is missing for magic link', async ({ page }) => {
    // Click magic link without entering email
    await page.getByRole('button', { name: /send magic link/i }).click()
    await expect(page.getByText(/enter your email first/i)).toBeVisible()
  })

  test('empty submit stays on login page (HTML5 required validation)', async ({ page }) => {
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL('/login')
  })
})
