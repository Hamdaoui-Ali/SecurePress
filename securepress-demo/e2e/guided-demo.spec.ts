import { expect, test } from '@playwright/test'

test('exécute les huit étapes guidées jusqu’au rapport projeté', async ({ page }) => {
  await page.goto('/#/')

  await page.getByRole('button', { name: /Démarrer la démo guidée/i }).click()
  const startDialog = page.getByRole('dialog', {
    name: /Démarrer la démo guidée/i,
  })
  await expect(startDialog).toBeVisible()
  await startDialog
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  const guide = page.getByRole('region', { name: /Guide de démonstration/i })
  await expect(guide.getByText('Étape 1 sur 8')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 2 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Inventaire terminé')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 3 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(page.getByText('Audit simulé terminé')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 4 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="open-f001"]').click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 5 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="apply-F-001"]').click()
  await expect(page.getByText('Appliqué dans la simulation')).toBeVisible()
  await guide.getByRole('button', { name: 'Suivant' }).click()

  await expect(guide.getByText('Étape 6 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="run-validation"]').click()
  await expect(page.getByText('Validation simulée terminée')).toBeVisible()
  await guide.getByRole('button', { name: 'Suivant' }).click()

  await expect(guide.getByText('Étape 7 sur 8')).toBeVisible()
  await expect(page.getByText('82 / 100')).toBeVisible()
  await guide.getByRole('button', { name: 'Suivant' }).click()

  await expect(guide.getByText('Étape 8 sur 8')).toBeVisible()
  await expect(
    page.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
  ).toBeVisible()
  await guide.getByRole('button', { name: 'Terminer le guide' }).click()
  await expect(page.getByRole('region', { name: /Guide de démonstration/i })).toHaveCount(0)
  await expect(page.getByText('82 / 100')).toBeVisible()
})

test('confirme le reset global et revient à la vue initiale', async ({ page }) => {
  await page.goto('/#/rapport')
  await page.getByRole('button', { name: /Réinitialiser la démo/i }).click()

  const resetDialog = page.getByRole('dialog', {
    name: /Réinitialiser la démo/i,
  })
  await resetDialog
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  await expect(page).toHaveURL(/#\/$/)
  await expect(
    page.getByRole('img', { name: /Indice pédagogique simulé : 42 sur 100/i }),
  ).toBeVisible()
  await expect(page.getByText('0 remédiation simulée')).toBeVisible()
  const stored = await page.evaluate(() => localStorage.getItem('securepress.audit-lab.v1'))
  expect(stored).toBeNull()
})
