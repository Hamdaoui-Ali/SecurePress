import { describe, expect, test } from 'vitest'
import { createInitialAssessment } from '../domain/models'
import { createSimulationEngine } from './simulation-engine'

describe('simulation engine', () => {
  test('refuse la validation avant l’audit', async () => {
    const engine = createSimulationEngine({
      delayMs: 0,
      now: () => new Date('2026-09-09T10:00:00Z'),
    })

    await expect(
      engine.runValidation(createInitialAssessment()),
    ).rejects.toThrow('AUDIT_REQUIRED')
  })

  test('exécute le parcours inventaire puis audit', async () => {
    const engine = createSimulationEngine({
      delayMs: 0,
      now: () => new Date('2026-09-09T10:00:00Z'),
    })
    const initial = createInitialAssessment()

    const afterInventory = await engine.runInventory(initial)
    const afterAudit = await engine.runStaticAudit(afterInventory)

    expect(afterInventory.stage).toBe('inventory')
    expect(afterInventory.inventoryCompleted).toBe(true)
    expect(afterAudit.stage).toBe('audit')
    expect(afterAudit.auditCompleted).toBe(true)
    expect(afterAudit.visibleFindingIds).toHaveLength(10)
    expect(afterAudit.timeline).toHaveLength(2)
  })
})
