import { describe, expect, test } from 'vitest'
import { createInitialAssessment } from './models'
import { AssessmentStateSchema } from './schema'

describe('AssessmentStateSchema', () => {
  test('ajoute les valeurs par défaut aux états sauvegardés par une version antérieure', () => {
    const {
      lastRun: _lastRun,
      operationHistory: _operationHistory,
      ...legacyState
    } = createInitialAssessment()

    expect(AssessmentStateSchema.parse(legacyState)).toMatchObject({
      lastRun: null,
      operationHistory: [],
    })
  })
})
