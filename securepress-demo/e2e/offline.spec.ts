import { expect, test } from '@playwright/test'

test('ne contacte aucun hôte externe', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      external.push(request.url())
    }
  })

  await page.goto('/')
  await page.getByRole('button', { name: /Démarrer le parcours guidé/i }).click()
  await expect(
    page.getByRole('dialog', { name: /Démarrer le parcours guidé/i }),
  ).toBeVisible()

  expect(external).toEqual([])
})
