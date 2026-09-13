import { expect, test, type Page } from '@playwright/test'

const source = {
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
} as const

function createState(stage: 'inventory' | 'audit') {
  return {
    source,
    stage,
    inventoryCompleted: stage === 'audit',
    auditCompleted: false,
    visibleFindingIds: [],
    appliedFindingIds: [],
    completedHardeningCheckIds: [],
    validationResults: {},
    timeline: [],
    guidedStep: null,
    lastRun: null,
    operationHistory: [],
  } as const
}

async function openOperation(page: Page, route: string, state: ReturnType<typeof createState>) {
  await page.addInitScript((nextState) => {
    window.localStorage.setItem('securepress.audit-lab.v1', JSON.stringify(nextState))
  }, state)
  await page.goto(`/#/${route}`)
}

test.describe('operation action layout', () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`keeps discovery and analysis actions roomy and single-line at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)

      for (const operation of [
        {
          route: 'inventaire',
          heading: 'Index the source package',
          label: 'Run discovery',
          state: createState('inventory'),
        },
        {
          route: 'audit',
          heading: 'Analyze findings without overclaiming',
          label: 'Analyze findings',
          state: createState('audit'),
        },
      ]) {
        await openOperation(page, operation.route, operation.state)
        await expect(page.getByRole('heading', { name: operation.heading })).toBeVisible()

        const button = page
          .locator('.page-heading-with-action > .button')
          .filter({ hasText: operation.label })
        await expect(button).toBeVisible()

        const metrics = await button.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          const style = getComputedStyle(element)
          return {
            width: rect.width,
            height: rect.height,
            whiteSpace: style.whiteSpace,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
          }
        })

        expect(metrics.width).toBeGreaterThanOrEqual(180)
        expect(metrics.height).toBeGreaterThanOrEqual(44)
        expect(metrics.whiteSpace).toBe('nowrap')
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
      }
    })
  }
})
