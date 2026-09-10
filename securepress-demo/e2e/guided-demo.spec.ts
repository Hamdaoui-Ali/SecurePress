import { expect, test } from '@playwright/test'

test('runs the eight guided workspace steps through the provenance report', async ({ page }) => {
  await page.goto('/#/')

  await page.getByRole('button', { name: /Démarrer le parcours guidé/i }).click()
  const startDialog = page.getByRole('dialog', {
    name: /Démarrer le parcours guidé/i,
  })
  await expect(startDialog).toBeVisible()
  await startDialog
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  const guide = page.getByRole('region', { name: /Guided workspace workflow/i })
  await expect(guide.getByText('Étape 1 sur 8')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 2 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Workspace ready')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 3 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 4 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="open-f001"]').click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await guide.getByRole('button', { name: 'Suivant' }).click()
  await expect(guide.getByText('Étape 5 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="apply-F-001"]').click()
  await expect(
    page.locator('#main-content').getByText('Change set applied', { exact: true }),
  ).toBeVisible()
  await guide.getByRole('button', { name: 'Suivant' }).click()

  await expect(guide.getByText('Étape 6 sur 8')).toBeVisible()
  await page.locator('[data-guide-id="run-validation"]').click()
  await expect(
    page.locator('#main-content').getByText(
      'Control campaign completed · target verification pending',
      { exact: true },
    ),
  ).toBeVisible()
  await guide.getByRole('button', { name: 'Suivant' }).click()

  await expect(guide.getByText('Étape 7 sur 8')).toBeVisible()
  await expect(page.getByText('82 / 100')).toBeVisible()
  await guide.getByRole('button', { name: 'Suivant' }).click()

  await expect(guide.getByText('Étape 8 sur 8')).toBeVisible()
  await expect(
    page.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
  ).toBeVisible()
  await guide.getByRole('button', { name: 'Terminer le guide' }).click()
  await expect(page.getByRole('region', { name: /Guided workspace workflow/i })).toHaveCount(0)
  await expect(page.getByText('82 / 100')).toBeVisible()
})

test('confirms the workspace reset and returns to the initial state', async ({ page }) => {
  await page.goto('/#/rapport')
  await page.getByRole('button', { name: /Reset workspace/i }).click()

  const resetDialog = page.getByRole('dialog', {
    name: /Reset workspace/i,
  })
  await resetDialog
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  await expect(page).toHaveURL(/#\/$/)
  await expect(
    page.getByRole('img', { name: /Security posture score: 42 out of 100/i }),
  ).toBeVisible()
  const stored = await page.evaluate(() => localStorage.getItem('securepress.audit-lab.v1'))
  expect(stored).toBeNull()
})
