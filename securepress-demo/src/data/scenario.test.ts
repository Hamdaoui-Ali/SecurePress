import { describe, expect, test } from 'vitest'
import { telcoScenario } from './scenario'

describe('LNET TELCO scenario', () => {
  test('contient le périmètre attendu', () => {
    expect(telcoScenario.project.name).toBe('LNET TELCO')
    expect(telcoScenario.project.wordpressVersion).toBe('6.4.3')
    expect(telcoScenario.inventory.pluginCount).toBe(17)
    expect(telcoScenario.inventory.themeCount).toBe(4)
    expect(telcoScenario.findings).toHaveLength(10)
  })

  test('relie chaque constat à une remédiation et une validation', () => {
    for (const finding of telcoScenario.findings) {
      expect(
        telcoScenario.remediations.some(
          (item) =>
            item.id === finding.remediationId && item.findingId === finding.id,
        ),
      ).toBe(true)
      expect(
        finding.validationIds.every((id) =>
          telcoScenario.validationChecks.some((item) => item.id === id),
        ),
      ).toBe(true)
    }
  })
})
