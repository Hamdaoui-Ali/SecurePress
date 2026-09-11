import { expect, type Page } from '@playwright/test'

export async function prepareSource(page: Page) {
  await page.goto('/#/setup')
  const setupHeading = page.getByRole('heading', {
    name: 'Choose your WordPress source',
  })

  if (await setupHeading.count()) {
    await page.getByRole('button', {
      name: 'Use prepared LNET TELCO package',
    }).click()
    await page.getByRole('button', { name: 'Verify source' }).click()
  }

  await expect(
    page.getByRole('heading', { name: 'Build the workspace assessment' }),
  ).toBeVisible()
}

