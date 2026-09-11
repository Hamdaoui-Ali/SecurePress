import { expect, test } from '@playwright/test'

test('requires a verified local source before opening the workspace', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Connect a local WordPress source' }),
  ).toBeVisible()

  await page.getByRole('button', {
    name: 'Use prepared LNET TELCO package',
  }).click()
  await page.getByRole('button', { name: 'Verify source' }).click()

  await expect(
    page.getByRole('heading', { name: 'Assess workspace posture' }),
  ).toBeVisible()
})

test('validates the local campaign and its evidence boundary', async ({ page }) => {
  await page.addInitScript(({ storageKey }) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        source: {
          status: 'ready',
          mode: 'prepared',
          pathLabel: 'C:\\SecurePress\\targets\\lnet-telco-wordpress',
          displayName: 'LNET TELCO WordPress source package',
          wordpressVersion: '6.4.3',
          fileMarkerCount: 4,
          pluginCount: 17,
          themeCount: 4,
          verifiedAt: '2026-09-11T10:00:00.000Z',
          message: 'Prepared local source package verified',
        },
        stage: 'audit',
        inventoryCompleted: true,
        auditCompleted: true,
        visibleFindingIds: [],
        appliedFindingIds: [],
        completedHardeningCheckIds: [],
        validationResults: {},
        timeline: [],
        guidedStep: null,
        lastRun: null,
        operationHistory: [],
      }),
    )
  }, { storageKey: 'securepress.audit-lab.v1' })

  await page.goto('/#/validation')

  const runValidation = page.getByRole('button', {
    name: /Run control campaign/i,
  })
  await expect(runValidation).toBeEnabled()
  await runValidation.click()

  await expect(
    page.locator('#main-content').getByText(
      'Control campaign completed · target verification pending',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(
    page.getByText('External dynamic retest — NOT EXECUTED'),
  ).toBeVisible()
  await expect(page.getByText('PASS').first()).toBeVisible()
  await expect(page.getByText('Target verification pending').first()).toBeVisible()

  const loginFailure = page.getByRole('button', {
    name: /Record a failed login attempt/i,
  })
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await loginFailure.click()
  }
  await expect(
    page.getByText('Temporary block expected: 15 minutes'),
  ).toBeVisible()
})

test('downloads the final report as a PDF', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', {
    name: 'Use prepared LNET TELCO package',
  }).click()
  await page.getByRole('button', { name: 'Verify source' }).click()
  await expect(
    page.getByRole('heading', { name: 'Assess workspace posture' }),
  ).toBeVisible()

  await page.goto('/#/rapport')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download report' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('securepress-lnet-telco-report.pdf')
})
