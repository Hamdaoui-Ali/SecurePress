import { expect, test } from '@playwright/test'

test('runs local workspace operations, preserves their activity, and clears them on reset', async ({
  page,
}) => {
  await page.goto('/#/inventaire')

  const discovery = page.locator('[data-guide-id="run-inventory"]')
  await expect(discovery).toBeEnabled()
  await discovery.click()
  await expect(discovery).toBeDisabled()
  await expect(
    page.getByRole('progressbar', { name: 'Discovery run progress' }),
  ).toHaveAttribute('aria-valuenow', /\d+/)
  await expect(page.getByText('Workspace ready', { exact: true })).toBeVisible()
  await expect(discovery).toBeEnabled()

  await page.goto('/#/audit')
  const analysis = page.locator('[data-guide-id="run-audit"]')
  await expect(analysis).toBeEnabled()
  await analysis.click()
  await expect(analysis).toBeDisabled()
  await expect(
    page.getByRole('progressbar', { name: 'Finding analysis progress' }),
  ).toHaveAttribute('aria-valuenow', /\d+/)
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible()
  await expect(analysis).toBeEnabled()

  await page.goto('/#/remediation')
  const changeSet = page.locator('[data-guide-id="apply-F-001"]')
  await expect(changeSet).toBeEnabled()
  await changeSet.click()
  await expect(changeSet).toBeDisabled()
  await expect(
    page.getByRole('progressbar', { name: 'Change set progress' }),
  ).toHaveAttribute('aria-valuenow', /\d+/)
  await expect(
    page.locator('#remediation-F-001').getByText('Change set applied', { exact: true }),
  ).toBeVisible()
  await expect(
    page.locator('#remediation-F-001').getByText('Target verification required', {
      exact: true,
    }),
  ).toBeVisible()

  await page.goto('/#/validation')
  const controlCampaign = page.locator('[data-guide-id="run-validation"]')
  await expect(controlCampaign).toBeEnabled()
  await controlCampaign.click()
  await expect(controlCampaign).toBeDisabled()
  await expect(
    page.getByRole('progressbar', { name: 'Control campaign progress' }),
  ).toHaveAttribute('aria-valuenow', /\d+/)
  await expect(page.getByText('PASS', { exact: true }).first()).toBeVisible()
  await expect(
    page.locator('#main-content').getByText(
      'Control campaign completed · target verification pending',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(page.getByLabel('Workspace context')).toContainText(
    'Target verification required',
  )

  await page.reload()
  const activity = page.getByRole('region', { name: 'Latest operation' })
  await expect(activity).toContainText('Control campaign')
  await expect(
    activity.getByRole('list', { name: 'Recent operations' }),
  ).toContainText('Change set applied · F-001')

  await page.getByRole('button', { name: 'Reset workspace' }).click()
  const resetDialog = page.getByRole('dialog', { name: 'Reset workspace?' })
  await expect(resetDialog).toBeVisible()
  await resetDialog
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByText('No recent operations', { exact: true })).toBeVisible()
  await expect(
    page.getByText('No workspace operation has completed yet.', { exact: true }),
  ).toBeVisible()
  await expect(
    page.evaluate(() => window.localStorage.getItem('securepress.audit-lab.v1')),
  ).resolves.toBeNull()

  await page.goto('/#/inventaire')
  await expect(page.locator('[data-guide-id="run-inventory"]')).toBeEnabled()
})
