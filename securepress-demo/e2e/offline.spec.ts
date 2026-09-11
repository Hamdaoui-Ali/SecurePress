import { expect, test } from '@playwright/test'
import { prepareSource } from './helpers'

test('does not contact an external host', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      external.push(request.url())
    }
  })

  await prepareSource(page)
  await page.getByRole('button', { name: /Start guided walkthrough/i }).click()
  await expect(
    page.getByRole('dialog', { name: /Start the guided walkthrough/i }),
  ).toBeVisible()

  expect(external).toEqual([])
})
