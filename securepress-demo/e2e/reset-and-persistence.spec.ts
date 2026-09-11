import { expect, test } from '@playwright/test'
import { prepareSource } from './helpers'

test('persists a local change set and returns to source setup after reset', async ({
  page,
}) => {
  await prepareSource(page)
  await page.goto('/#/inventaire')
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Workspace ready', { exact: true })).toBeVisible({
    timeout: 15_000,
  })

  await page.getByRole('link', { name: 'Finding analysis', exact: true }).click()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible({ timeout: 10_000 })

  await page.getByRole('link', { name: 'Change sets' }).click()
  const applyFinding = page.locator('[data-guide-id="apply-F-001"]')
  await expect(applyFinding).toBeEnabled()
  await applyFinding.click()
  await expect(
    page.locator('#main-content').getByText('Change set applied', { exact: true }),
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Change set applied · F-001' }),
  ).toBeDisabled()
  const storedAfterReload = await page.evaluate(() =>
    window.localStorage.getItem('securepress.audit-lab.v1'),
  )
  expect(storedAfterReload).toContain('F-001')

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
  await expect(
    page.evaluate(() => window.localStorage.getItem('securepress.audit-lab.v1')),
  ).resolves.toBeNull()
})
