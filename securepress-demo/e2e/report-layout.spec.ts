import { expect, test } from '@playwright/test'

const reportState = {
  source: {
    status: 'ready',
    mode: 'prepared',
    pathLabel: 'C:\\SecurePress\\targets\\lnet-telco-wordpress',
    displayName: 'lnet-telco-wordpress',
    wordpressVersion: '6.4.3',
    fileMarkerCount: 42,
    pluginCount: 17,
    themeCount: 4,
    verifiedAt: '2026-09-13T18:00:00.000Z',
    message: 'Source verified. No website was contacted.',
  },
  stage: 'report',
  inventoryCompleted: true,
  auditCompleted: true,
  visibleFindingIds: [],
  appliedFindingIds: [],
  completedHardeningCheckIds: [],
  validationResults: {
    'external-dynamic-retest': 'dynamic_retest_not_executed',
  },
  timeline: [],
  guidedStep: null,
  lastRun: null,
  operationHistory: [],
} as const

async function openReport(page: Parameters<typeof test>[0]['page']) {
  await page.addInitScript((state) => {
    window.localStorage.setItem('securepress.audit-lab.v1', JSON.stringify(state))
  }, reportState)
  await page.goto('/#/rapport')
  await expect(
    page.getByRole('heading', { name: 'Compare, explain, and leave an evidence trail' }),
  ).toBeVisible()
}

test('gives report actions equal room and a visible gap on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openReport(page)

  const layout = await page.locator('.report-actions').evaluate((element) => {
    const buttons = Array.from(element.querySelectorAll('button')).map((button) => {
      const rect = button.getBoundingClientRect()
      return { left: rect.left, right: rect.right, width: rect.width, height: rect.height }
    })

    return { buttons }
  })

  expect(layout.buttons).toHaveLength(2)
  expect(layout.buttons[0].width).toBeGreaterThanOrEqual(150)
  expect(layout.buttons[0].width).toBeCloseTo(layout.buttons[1].width, 0)
  expect(layout.buttons[0].height).toBeGreaterThanOrEqual(44)
  expect(layout.buttons[1].left - layout.buttons[0].right).toBeGreaterThanOrEqual(8)
})

test('stacks report actions with a visible gap on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openReport(page)

  const layout = await page.locator('.report-actions').evaluate((element) => {
    const buttons = Array.from(element.querySelectorAll('button')).map((button) => {
      const rect = button.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom, width: rect.width }
    })

    return { buttons }
  })

  expect(layout.buttons).toHaveLength(2)
  expect(layout.buttons[0].width).toBeCloseTo(layout.buttons[1].width, 0)
  expect(layout.buttons[1].top - layout.buttons[0].bottom).toBeGreaterThanOrEqual(8)
})
