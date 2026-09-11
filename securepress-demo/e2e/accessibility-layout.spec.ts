import { expect, test } from '@playwright/test'
import { prepareSource } from './helpers'

async function prepareAudit(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/#/inventaire')
  await page.locator('[data-guide-id="run-inventory"]').click()
  await expect(page.getByText('Workspace ready')).toBeVisible({ timeout: 15_000 })

  await page.getByRole('link', { name: 'Finding analysis', exact: true }).click()
  await page.locator('[data-guide-id="run-audit"]').click()
  await expect(
    page.getByText('Finding analysis completed', { exact: true }),
  ).toBeVisible()
}

test('supports the keyboard and restores focus after modal surfaces', async ({
  page,
}) => {
  await prepareSource(page)

  const skipLink = page.getByRole('link', { name: /Skip to content/i })
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
  await expect(resetDialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(resetDialog).toHaveCount(0)
  await expect(resetTrigger).toBeFocused()
})

test('stays readable at three viewports and communicates states with text', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await prepareSource(page)

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }))
    expect(dimensions.documentWidth).toBeLessThanOrEqual(viewport.width)
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(viewport.width)

    await expect(page.getByText('Source verified')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start discovery' })).toBeVisible()
    await expect(
      page.getByRole('img', { name: /Security posture score: 42 out of 100/i }),
    ).toHaveCount(0)
    await expect(page.getByText('LNET TELCO workspace')).toBeVisible()
    await expect(page.getByRole('button', { name: /Start guided walkthrough/i })).toBeVisible()
    await expect(
      page.locator('#main-content').getByRole('heading', { name: 'Workspace workflow' }),
    ).toBeVisible()
  }
})

test('reduces transitions when the system requests less motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await prepareSource(page)

  const transitionDuration = await page
    .getByRole('button', { name: /Reset workspace/i })
    .evaluate((element) => getComputedStyle(element).transitionDuration)

  expect(Number.parseFloat(transitionDuration)).toBeLessThan(0.02)
})
