import { expect, test } from '@playwright/test'

test('persists a local change set and returns to the initial state after reset', async ({
  page,
}) => {
  await page.goto('/#/inventaire')
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Workspace ready')).toBeVisible()

  await page.getByRole('link', { name: 'Audit & qualification' }).click()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Remédiation' }).click()
  const applyFinding = page.locator('[data-guide-id="apply-F-001"]')
  await expect(applyFinding).toBeEnabled()
  await applyFinding.click()
  await expect(
    page.locator('#main-content').getByText('Change set applied', { exact: true }),
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('button', { name: /Change set applied . F-001/i }),
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
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  await page.goto('/#/remediation')
  await expect(page.getByText('Complete finding analysis before preparing a change set')).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Apply change set . F-001/i }),
  ).toBeDisabled()
  await expect(
    page.getByText('0', { exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.evaluate(() => window.localStorage.getItem('securepress.audit-lab.v1')),
  ).resolves.toBeNull()
})
