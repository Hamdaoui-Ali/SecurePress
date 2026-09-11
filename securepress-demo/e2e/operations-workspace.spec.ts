import { expect, test } from '@playwright/test'
import { prepareSource } from './helpers'

test('runs local workspace operations, preserves their activity, and clears them on reset', async ({
  page,
}) => {
  test.setTimeout(60_000)

  await prepareSource(page)
  await page.goto('/#/inventaire')

  const discovery = page.locator('[data-guide-id="run-inventory"]')
  await expect(discovery).toBeEnabled()
  await discovery.click()
  await expect(discovery).toBeDisabled()
  const discoveryProgress = page.getByRole('progressbar', { name: 'Discovery run progress' })
  await expect(discoveryProgress).toBeVisible()
  await expect(discoveryProgress).toHaveAttribute(
    'aria-valuetext',
    /^(?!100% complete$)\d+% complete$/,
  )
  await expect(page.locator('.operation-progress-running')).toBeVisible()
  await expect(page.getByText('Workspace ready', { exact: true })).toBeVisible({
    timeout: 15_000,
  })
  await expect(discovery).toBeEnabled()

  await page.goto('/#/audit')
  const analysis = page.locator('[data-guide-id="run-audit"]')
  await expect(analysis).toBeEnabled()
  await analysis.click()
  await expect(analysis).toBeDisabled()
  const analysisProgress = page.getByRole('progressbar', { name: 'Finding analysis progress' })
  await expect(analysisProgress).toBeVisible()
  await expect(analysisProgress).toHaveAttribute(
    'aria-valuetext',
    /^(?!100% complete$)\d+% complete$/,
  )
  await expect(page.locator('.operation-progress-running')).toBeVisible()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible({ timeout: 10_000 })
  await expect(analysis).toBeEnabled()

  await page.goto('/#/remediation')
  const changeSet = page.locator('[data-guide-id="apply-F-001"]')
  await expect(changeSet).toBeEnabled()
  await changeSet.click()
  await expect(changeSet).toBeDisabled()
  const changeSetProgress = page.getByRole('progressbar', { name: 'Change set progress' })
  await expect(changeSetProgress).toBeVisible()
  await expect(changeSetProgress).toHaveAttribute(
    'aria-valuetext',
    /^(?!100% complete$)\d+% complete$/,
  )
  await expect(page.locator('.operation-progress-running')).toBeVisible()
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
  const controlProgress = page.getByRole('progressbar', { name: 'Control campaign progress' })
  await expect(controlProgress).toBeVisible()
  await expect(controlProgress).toHaveAttribute(
    'aria-valuetext',
    /^(?!100% complete$)\d+% complete$/,
  )
  await expect(page.locator('.operation-progress-running')).toBeVisible()
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

  const firstCampaignId = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('securepress.audit-lab.v1')!).lastRun.id,
  )
  await controlCampaign.click()
  await expect(controlProgress).toBeVisible()
  await expect(controlCampaign).toBeDisabled()
  await expect(page.locator('.operation-progress-running')).toBeVisible()
  await expect(controlCampaign).toBeEnabled()
  const repeatedCampaign = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('securepress.audit-lab.v1')!).lastRun,
  )
  expect(repeatedCampaign.id).not.toBe(firstCampaignId)
  expect(repeatedCampaign).toMatchObject({
    status: 'completed', currentStep: 'Finalizing control campaign', processed: 10, total: 10,
  })

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
    .getByRole('button', { name: 'Confirm reset' })
    .click()

  await expect(page).toHaveURL(/#\/setup$/)
  await expect(
    page.getByRole('heading', { name: 'Choose your WordPress source' }),
  ).toBeVisible()
  await expect(
    page.evaluate(() => window.localStorage.getItem('securepress.audit-lab.v1')),
  ).resolves.toBeNull()

  await prepareSource(page)
  await page.goto('/#/inventaire')
  await expect(page.locator('[data-guide-id="run-inventory"]')).toBeEnabled()
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`keeps active and applied change sets readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await prepareSource(page)
    await page.goto('/#/inventaire')
    await page.locator('[data-guide-id="run-inventory"]').click()
    await expect(page.getByText('Workspace ready', { exact: true })).toBeVisible({
      timeout: 15_000,
    })
    await page.goto('/#/audit')
    await page.locator('[data-guide-id="run-audit"]').click()
    await expect(page.getByText('Finding analysis completed', { exact: true })).toBeVisible({
      timeout: 10_000,
    })
    await page.goto('/#/remediation')
    const card = page.locator('#remediation-F-001')
    await card.getByRole('button', { name: 'Apply change set · F-001' }).click()
    await expect(card.getByRole('button', { name: 'Applying change set · F-001' })).toBeDisabled()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
    await expect(card.getByText('Change set applied', { exact: true })).toBeVisible()
    await expect(card.getByText('Target verification required')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
    expect(errors).toEqual([])
  })
}
