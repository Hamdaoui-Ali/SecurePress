import { expect, test } from '@playwright/test'
import { prepareSource } from './helpers'

test('runs the eight guided workspace steps through the provenance report', async ({ page }) => {
  test.setTimeout(60_000)

  await prepareSource(page)
  await page.goto('/#/')

  await page.getByRole('button', { name: /Start guided walkthrough/i }).click()
  const startDialog = page.getByRole('dialog', {
    name: /Start the guided walkthrough/i,
  })
  await expect(startDialog).toBeVisible()
  await startDialog
    .getByRole('button', { name: 'Confirm reset' })
    .click()

  const guide = page.getByRole('region', { name: /Guided workspace workflow/i })
  await expect(guide.getByText('Step 1 of 8')).toBeVisible()

  await guide.getByRole('button', { name: 'Next' }).click()
  await expect(guide.getByText('Step 2 of 8')).toBeVisible()
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Workspace ready')).toBeVisible({ timeout: 15_000 })
  await expect(
    page.getByRole('link', { name: 'Continue to finding analysis' }),
  ).toBeVisible()

  await guide.getByRole('button', { name: 'Next' }).click()
  await expect(guide.getByText('Step 3 of 8')).toBeVisible()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible({ timeout: 10_000 })
  await expect(
    page.getByRole('link', { name: 'Continue to corrections' }),
  ).toBeVisible()

  await guide.getByRole('button', { name: 'Next' }).click()
  await expect(guide.getByText('Step 4 of 8')).toBeVisible()
  await page.locator('[data-guide-id="open-f001"]').click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await guide.getByRole('button', { name: 'Next' }).click()
  await expect(guide.getByText('Step 5 of 8')).toBeVisible()
  await page.locator('[data-guide-id="apply-F-001"]').click()
  await expect(
    page.locator('#main-content').getByText('Change set applied', { exact: true }),
  ).toBeVisible()
  await guide.getByRole('button', { name: 'Next' }).click()

  await expect(guide.getByText('Step 6 of 8')).toBeVisible({ timeout: 15_000 })
  await page.locator('[data-guide-id="run-validation"]').click()
  await expect(
    page.locator('#main-content').getByText(
      'Control campaign completed · target verification pending',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Review report' })).toBeVisible()
  await guide.getByRole('button', { name: 'Next' }).click()

  await expect(guide.getByText('Step 7 of 8')).toBeVisible()
  await expect(page.getByText('82 / 100')).toBeVisible()
  await guide.getByRole('button', { name: 'Next' }).click()

  await expect(guide.getByText('Step 8 of 8')).toBeVisible()
  await expect(
    page.getByText('External dynamic retest — NOT EXECUTED'),
  ).toBeVisible()
  await guide.getByRole('button', { name: 'Finish walkthrough' }).click()
  await expect(page.getByRole('region', { name: /Guided workspace workflow/i })).toHaveCount(0)
  await expect(page.getByText('82 / 100')).toBeVisible()
})

test('confirms the workspace reset and returns to source setup', async ({ page }) => {
  await prepareSource(page)
  await page.goto('/#/rapport')
  await page.getByRole('button', { name: /Reset workspace/i }).click()

  const resetDialog = page.getByRole('dialog', {
    name: /Reset workspace/i,
  })
  await resetDialog
    .getByRole('button', { name: 'Confirm reset' })
    .click()

  await expect(page).toHaveURL(/#\/setup$/)
  await expect(
    page.getByRole('heading', { name: 'Choose your WordPress source' }),
  ).toBeVisible()
  const stored = await page.evaluate(() => localStorage.getItem('securepress.audit-lab.v1'))
  expect(stored).toBeNull()
})
