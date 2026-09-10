import { expect, test } from '@playwright/test'

async function prepareAudit(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/#/inventaire')
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Workspace ready')).toBeVisible()

  await page.getByRole('link', { name: 'Audit & qualification' }).click()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible()
}

test('supporte le clavier et restitue le focus après les surfaces modales', async ({
  page,
}) => {
  await page.goto('/#/')

  const skipLink = page.getByRole('link', { name: /Aller au contenu/i })
  await expect(skipLink).toBeAttached()
  await skipLink.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()

  await prepareAudit(page)

  const findingTrigger = page.locator('[data-guide-id="open-f001"]')
  await findingTrigger.focus()
  await page.keyboard.press('Enter')

  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(findingTrigger).toBeFocused()

  const resetTrigger = page.getByRole('button', { name: /Reset workspace/i })
  await resetTrigger.focus()
  await page.keyboard.press('Enter')

  const resetDialog = page.getByRole('dialog', {
    name: /Reset workspace/i,
  })
  await expect(resetDialog).toBeVisible()
  await expect(resetDialog.getByRole('button', { name: 'Annuler' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(resetDialog).toHaveCount(0)
  await expect(resetTrigger).toBeFocused()
})

test('reste lisible aux trois viewports et transmet les états par du texte', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/#/')

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }))
    expect(dimensions.documentWidth).toBeLessThanOrEqual(viewport.width)
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(viewport.width)

    await expect(
      page.getByRole('img', { name: /Security posture score: 42 out of 100/i }),
    ).toBeVisible()
    await expect(page.getByText('TELCO workspace')).toBeVisible()
    await expect(page.getByRole('button', { name: /Démarrer le parcours guidé/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Workspace workflow' })).toBeVisible()

  }
})

test('réduit les transitions quand le système demande moins de mouvement', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/')

  const transitionDuration = await page
    .getByRole('button', { name: /Reset workspace/i })
    .evaluate((element) => getComputedStyle(element).transitionDuration)

  expect(Number.parseFloat(transitionDuration)).toBeLessThan(0.02)
})
