import { expect, test } from '@playwright/test'

test('persiste une remédiation locale puis revient à l’état initial après reset', async ({
  page,
}) => {
  await page.goto('/#/inventaire')
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Inventaire terminé')).toBeVisible()

  await page.getByRole('link', { name: 'Audit & qualification' }).click()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(page.getByText('Audit simulé terminé')).toBeVisible()

  await page.getByRole('link', { name: 'Remédiation' }).click()
  const applyFinding = page.locator('[data-guide-id="apply-F-001"]')
  await expect(applyFinding).toBeEnabled()
  await applyFinding.click()
  await expect(page.getByText('Appliqué dans la simulation')).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('button', { name: /Déjà appliqué F-001/i }),
  ).toBeDisabled()
  const storedAfterReload = await page.evaluate(() =>
    window.localStorage.getItem('securepress.audit-lab.v1'),
  )
  expect(storedAfterReload).toContain('F-001')

  await page.getByRole('button', { name: /Réinitialiser la démo/i }).click()
  const resetDialog = page.getByRole('dialog', {
    name: /Réinitialiser la démo/i,
  })
  await resetDialog
    .getByRole('button', { name: 'Confirmer la réinitialisation' })
    .click()

  await page.goto('/#/remediation')
  await expect(page.getByText('Terminez d’abord l’audit statique simulé')).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Appliquer F-001 dans la simulation/i }),
  ).toBeDisabled()
  await expect(
    page.getByText('0', { exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.evaluate(() => window.localStorage.getItem('securepress.audit-lab.v1')),
  ).resolves.toBeNull()
})
