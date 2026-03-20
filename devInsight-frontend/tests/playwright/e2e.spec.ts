import { test, expect } from '@playwright/test'

test('register -> login -> view dashboard', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Register')
  await page.fill('input[placeholder="Full name"]', 'E2E User')
  const email = `e2e_${Date.now()}@example.com`
  await page.fill('input[placeholder="Email"]', email)
  await page.fill('input[placeholder="Password"]', 'Test@12345')
  await page.click('text=Register')
  // after register user should be redirected to home
  await page.waitForURL('**/')
  expect(await page.locator('text=Interviews').count()).toBeGreaterThanOrEqual(1)
})
