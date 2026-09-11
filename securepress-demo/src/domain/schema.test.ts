import { describe, expect, test } from 'vitest'
import { createInitialAssessment } from './models'
import { AssessmentStateSchema, OperationRunSchema } from './schema'

describe('AssessmentStateSchema', () => {
  test('accepts optional typed finding association and rejects malformed identifiers', () => {
    const run = {
      id: 'change-1', kind: 'change-set', status: 'failed',
      startedAt: '2026-09-10T10:00:00.000Z', message: 'Change set failed',
    }
    expect(OperationRunSchema.safeParse(run).success).toBe(true)
    expect(OperationRunSchema.parse({ ...run, findingId: 'F-001' }).findingId).toBe('F-001')
    expect(OperationRunSchema.safeParse({ ...run, findingId: 'unknown' }).success).toBe(false)
  })

  test('ajoute les valeurs par défaut aux états sauvegardés par une version antérieure', () => {
    const {
      lastRun: _lastRun,
      operationHistory: _operationHistory,
      ...legacyState
    } = createInitialAssessment()

    expect(AssessmentStateSchema.parse(legacyState)).toMatchObject({
      lastRun: null,
      operationHistory: [],
      source: { status: 'unconfigured', mode: null, pathLabel: '' },
    })
  })

  test('recovers malformed source metadata without blocking application boot', () => {
    const state = {
      ...createInitialAssessment(),
      source: { status: 'ready', pathLabel: 'C:\\tmp\\broken' },
    }

    expect(AssessmentStateSchema.parse(state).source).toMatchObject({
      status: 'unconfigured',
      mode: null,
      pathLabel: '',
    })
  })
})
