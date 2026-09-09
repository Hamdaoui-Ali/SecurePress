import { expect, test } from '@playwright/test'

test('ouvre la démo locale', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /SecurePress Audit Lab/i }),
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
    name: /Lancer la validation simulée/i,
  })
  await expect(runValidation).toBeEnabled()
  await runValidation.click()

  await expect(page.getByText('Validation simulée terminée')).toBeVisible()
  await expect(
    page.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
  ).toBeVisible()
  await expect(page.getByText('PASS simulé').first()).toBeVisible()
  await expect(page.getByText('Vérifié sur cible')).toHaveCount(0)

  const loginFailure = page.getByRole('button', {
    name: /Simuler un échec de connexion/i,
  })
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await loginFailure.click()
  }
  await expect(
    page.getByText('Blocage temporaire simulé : 15 minutes'),
  ).toBeVisible()
})
