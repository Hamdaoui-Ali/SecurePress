import { describe, expect, test } from 'vitest'
import { telcoScenario } from '../data/scenario'
import { createInitialAssessment } from '../domain/models'
import {
  createSimulationEngine,
  type ProgressUpdate,
} from './simulation-engine'

const fixedNow = () => new Date('2026-09-09T10:00:00Z')

function createEngine(progressUpdates: ProgressUpdate[] = []) {
  return createSimulationEngine({
    delayMs: 0,
    now: fixedNow,
    onProgress: (update) => progressUpdates.push(update),
  })
}

function expectPhasedProgress(
  updates: ProgressUpdate[],
  expectedSteps: string[],
) {
  expect(updates.map((update) => update.step)).toEqual(expectedSteps)
  expect(updates).toHaveLength(expectedSteps.length)
  expect(updates[0]?.percent).toBe(0)
  expect(updates.at(-1)?.percent).toBe(100)
  expect(updates.slice(0, -1).every((update) => update.percent < 100)).toBe(true)
  expect(
    updates.every((update, index) =>
      index === 0 || update.percent >= updates[index - 1]!.percent,
    ),
  ).toBe(true)
  expect(updates.every((update) => update.processed <= update.total)).toBe(true)
}

describe('simulation engine', () => {
  test('repeats every campaign phase and retains target-only outcomes', async () => {
    const updates: ProgressUpdate[] = []
    const engine = createEngine(updates)
    const initial = { ...createInitialAssessment(), auditCompleted: true }
    const first = await engine.runValidation(initial)
    const firstUpdates = [...updates]
    updates.length = 0
    const second = await engine.runValidation(first)
    expect(updates).toEqual(firstUpdates)
    expect(updates).toHaveLength(5)
    expect(second.validationResults).toEqual(first.validationResults)
    expect(second.validationResults['V-XMLRPC-TARGET']).toBe('target_validation_required')
  })

  test.each([
    ['V-FILE-EDITOR', 'simulated_pass'],
    ['V-XMLRPC-TARGET', 'target_validation_required'],
  ])('records the canonical result for individual control %s', async (id, status) => {
    const engine = createEngine()
    const state = await engine.runHardeningCheck(
      { ...createInitialAssessment(), auditCompleted: true }, id,
    )
    expect(state.completedHardeningCheckIds).toEqual([id])
    expect(state.validationResults[id]).toBe(status)
  })

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
    expect(afterAudit.timeline).toEqual([])
  })

  test('emits deterministic discovery phases with indexed component counts', async () => {
    const progressUpdates: ProgressUpdate[] = []
    const engine = createEngine(progressUpdates)

    const afterInventory = await engine.runInventory(createInitialAssessment())

    expectPhasedProgress(progressUpdates, [
      'Preparing source package',
      ...telcoScenario.inventory.components.map((component) => `Indexing ${component.name}`),
      'Source inventory ready',
    ])
    expect(progressUpdates.map((update) => update.processed)).toEqual([
      0,
      ...telcoScenario.inventory.components.map((_, index) => index + 1),
      22,
    ])
    expect(progressUpdates.every((update) => update.total === 22)).toBe(true)
    expect(afterInventory).toMatchObject({
      stage: 'inventory',
      inventoryCompleted: true,
    })
  })

  test('emits preparation, one update per component, and a discovery summary', async () => {
    const progressUpdates: ProgressUpdate[] = []
    await createEngine(progressUpdates).runInventory(createInitialAssessment())

    expect(progressUpdates[0]).toMatchObject({
      step: 'Preparing source package',
      processed: 0,
      total: telcoScenario.inventory.components.length,
    })
    expect(progressUpdates.slice(1, -1).map((update) => update.step)).toEqual(
      telcoScenario.inventory.components.map((component) => `Indexing ${component.name}`),
    )
    expect(progressUpdates.at(-1)).toMatchObject({
      step: 'Source inventory ready',
      processed: telcoScenario.inventory.components.length,
      total: telcoScenario.inventory.components.length,
    })
    expect(progressUpdates.every((update, index) => index === 0 || update.percent >= progressUpdates[index - 1]!.percent)).toBe(true)
  })

  test('emits ordered analysis phases before exposing findings', async () => {
    const discoveryUpdates: ProgressUpdate[] = []
    const analysisUpdates: ProgressUpdate[] = []
    const discoveryEngine = createEngine(discoveryUpdates)
    const afterInventory = await discoveryEngine.runInventory(
      createInitialAssessment(),
    )
    const analysisEngine = createEngine(analysisUpdates)

    const afterAudit = await analysisEngine.runStaticAudit(afterInventory)

    expectPhasedProgress(analysisUpdates, [
      'Preparing finding analysis',
      ...telcoScenario.findings.map((finding) => `Qualifying ${finding.id}`),
      'Finding analysis ready',
    ])
    expect(analysisUpdates.map((update) => update.processed)).toEqual([
      0,
      ...telcoScenario.findings.map((_, index) => index + 1),
      10,
    ])
    expect(analysisUpdates.every((update) => update.total === 10)).toBe(true)
    expect(afterAudit.visibleFindingIds).toHaveLength(10)
  })

  test('emits preparation, one update per finding, and an analysis summary', async () => {
    const progressUpdates: ProgressUpdate[] = []
    const engine = createEngine(progressUpdates)
    const inventory = await engine.runInventory(createInitialAssessment())

    progressUpdates.length = 0
    await engine.runStaticAudit(inventory)

    expect(progressUpdates[0]).toMatchObject({
      step: 'Preparing finding analysis',
      processed: 0,
      total: telcoScenario.findings.length,
    })
    expect(progressUpdates.slice(1, -1).map((update) => update.step)).toEqual(
      telcoScenario.findings.map((finding) => `Qualifying ${finding.id}`),
    )
    expect(progressUpdates.at(-1)).toMatchObject({
      step: 'Finding analysis ready',
      processed: telcoScenario.findings.length,
      total: telcoScenario.findings.length,
    })
  })

  test('emits change-set phases using the selected finding dependencies', async () => {
    const inventoryEngine = createEngine()
    const inventory = await inventoryEngine.runInventory(createInitialAssessment())
    const audit = await inventoryEngine.runStaticAudit(inventory)
    const progressUpdates: ProgressUpdate[] = []
    const engine = createEngine(progressUpdates)

    const afterChangeSet = await engine.applyRemediation(audit, 'F-001')

    expectPhasedProgress(progressUpdates, [
      'Préparation du change set',
      'Vérification des dépendances',
      'Enregistrement des changements',
      'Finalisation du change set',
    ])
    expect(progressUpdates.map((update) => update.processed)).toEqual([0, 1, 1, 1])
    expect(progressUpdates.map((update) => update.total)).toEqual([1, 1, 1, 1])
    expect(afterChangeSet.appliedFindingIds).toEqual(['F-001'])
  })

  test('reruns completed discovery and analysis through their deterministic phases', async () => {
    const progressUpdates: ProgressUpdate[] = []
    const engine = createEngine(progressUpdates)
    const inventory = await engine.runInventory(createInitialAssessment())
    const audit = await engine.runStaticAudit(inventory)
    const remediated = await engine.applyRemediation(audit, 'F-001')

    progressUpdates.length = 0
    const afterDiscoveryRerun = await engine.runInventory(remediated)

    expectPhasedProgress(progressUpdates, [
      'Preparing source package',
      ...telcoScenario.inventory.components.map((component) => `Indexing ${component.name}`),
      'Source inventory ready',
    ])
    expect(afterDiscoveryRerun).not.toBe(remediated)
    expect(afterDiscoveryRerun).toMatchObject({
      inventoryCompleted: true,
      auditCompleted: true,
      appliedFindingIds: ['F-001'],
    })

    progressUpdates.length = 0
    const afterAnalysisRerun = await engine.runStaticAudit(afterDiscoveryRerun)

    expectPhasedProgress(progressUpdates, [
      'Preparing finding analysis',
      ...telcoScenario.findings.map((finding) => `Qualifying ${finding.id}`),
      'Finding analysis ready',
    ])
    expect(afterAnalysisRerun).not.toBe(afterDiscoveryRerun)
    expect(afterAnalysisRerun).toMatchObject({
      inventoryCompleted: true,
      auditCompleted: true,
      appliedFindingIds: ['F-001'],
      visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
    })
    expect(afterAnalysisRerun.timeline).toEqual([])
  })

  test('emits controls phases for an LNET TELCO hardening check and the validation campaign', async () => {
    const setupEngine = createEngine()
    const inventory = await setupEngine.runInventory(createInitialAssessment())
    const audit = await setupEngine.runStaticAudit(inventory)
    const hardeningUpdates: ProgressUpdate[] = []
    const hardeningEngine = createEngine(hardeningUpdates)

    const afterHardening = await hardeningEngine.runHardeningCheck(
      audit,
      'V-FILE-EDITOR',
    )

    expectPhasedProgress(hardeningUpdates, [
      'Initialisation de la campagne de contrôles',
      'Contrôles de durcissement',
      'Clôture de la campagne',
    ])
    expect(hardeningUpdates.map((update) => update.processed)).toEqual([0, 1, 1])
    expect(hardeningUpdates.map((update) => update.total)).toEqual([2, 2, 2])
    expect(afterHardening.completedHardeningCheckIds).toEqual(['V-FILE-EDITOR'])
    expect(afterHardening.timeline).toEqual([])

    const campaignUpdates: ProgressUpdate[] = []
    const campaignEngine = createEngine(campaignUpdates)
    const afterValidation = await campaignEngine.runValidation(audit)

    expectPhasedProgress(campaignUpdates, [
      'Initialisation de la campagne de contrôles',
      'Contrôles fonctionnels',
      'Contrôles de durcissement',
      'Contrôles d’intégrité',
      'Clôture de la campagne',
    ])
    expect(campaignUpdates.map((update) => update.processed)).toEqual([0, 1, 3, 8, 10])
    expect(campaignUpdates.map((update) => update.total)).toEqual([
      10,
      10,
      10,
      10,
      10,
    ])
    expect(Object.keys(afterValidation.validationResults)).toHaveLength(
      telcoScenario.validationChecks.length + 1,
    )
    expect(afterValidation.timeline).toEqual([])
  })

  test('completes zero-delay runs deterministically', async () => {
    const firstUpdates: ProgressUpdate[] = []
    const secondUpdates: ProgressUpdate[] = []
    const firstResult = await createEngine(firstUpdates).runInventory(
      createInitialAssessment(),
    )
    const secondResult = await createEngine(secondUpdates).runInventory(
      createInitialAssessment(),
    )

    expect(firstUpdates).toEqual(secondUpdates)
    expect(firstResult).toEqual(secondResult)
  })

  test('propagates invalid change-set and required hardening-control errors without progress', async () => {
    const setupEngine = createEngine()
    const inventory = await setupEngine.runInventory(createInitialAssessment())
    const audit = await setupEngine.runStaticAudit(inventory)
    const progressUpdates: ProgressUpdate[] = []
    const engine = createEngine(progressUpdates)

    await expect(engine.applyRemediation(audit, 'F-999')).rejects.toThrow(
      'FINDING_NOT_FOUND',
    )
    await expect(engine.runHardeningCheck(audit, '  ')).rejects.toThrow(
      'HARDENING_CONTROL_REQUIRED',
    )
    expect(progressUpdates).toEqual([])
  })

  test('rejects unknown hardening check IDs without progress', async () => {
    const setupEngine = createEngine()
    const inventory = await setupEngine.runInventory(createInitialAssessment())
    const audit = await setupEngine.runStaticAudit(inventory)
    const progressUpdates: ProgressUpdate[] = []
    const engine = createEngine(progressUpdates)

    await expect(engine.runHardeningCheck(audit, 'file-editor')).rejects.toThrow(
      'HARDENING_CONTROL_NOT_FOUND',
    )
    expect(progressUpdates).toEqual([])
  })
})
