import { expect, test } from '@playwright/test'

test('opens the local workspace', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /SecurePress Operations/i }),
  ).toBeVisible()
})

test('valide la campagne locale et ses limites de preuve', async ({ page }) => {
  await page.addInitScript(({ storageKey }) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        stage: 'audit',
        inventoryCompleted: true,
        auditCompleted: true,
        visibleFindingIds: [],
        appliedFindingIds: [],
        completedHardeningCheckIds: [],
        validationResults: {},
        timeline: [],
        guidedStep: null,
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
    page.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
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
