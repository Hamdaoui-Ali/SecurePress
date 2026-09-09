import { expect, test } from '@playwright/test'

test('ouvre la démo locale', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /SecurePress Audit Lab/i }),
  ).toBeVisible()
})
