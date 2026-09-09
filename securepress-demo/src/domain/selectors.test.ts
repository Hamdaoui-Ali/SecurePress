import { describe, expect, test } from 'vitest'
import { telcoScenario } from '../data/scenario'
import { createInitialAssessment, type AssessmentState } from './models'
import {
  selectAppliedCount,
  selectPostureScore,
  selectRemainingRiskPoints,
  selectSeverityCounts,
  selectWorkflowProgress,
} from './selectors'

describe('assessment selectors', () => {
  test('calcule la posture initiale à 42', () => {
    expect(selectPostureScore(telcoScenario, createInitialAssessment())).toBe(42)
  })

  test('calcule la posture projetée à 82', () => {
    const state = {
      ...createInitialAssessment(),
      appliedFindingIds: [
        'F-001',
        'F-002',
        'F-003',
        'F-004',
        'F-007',
        'F-009',
      ],
    } satisfies AssessmentState

    expect(selectPostureScore(telcoScenario, state)).toBe(82)
  })

  test('calcule la répartition des sévérités du scénario', () => {
    expect(selectSeverityCounts(telcoScenario)).toEqual({
      critical: 2,
      high: 3,
      medium: 3,
      low: 1,
      variable: 1,
    })
  })

  test('dérive les compteurs et la progression depuis l’état', () => {
    const state = {
      ...createInitialAssessment(),
      stage: 'remediation',
      appliedFindingIds: ['F-001', 'F-002'],
    } satisfies AssessmentState

    expect(selectAppliedCount(state)).toBe(2)
    expect(selectRemainingRiskPoints(telcoScenario, state)).toBe(34)
    expect(selectWorkflowProgress(state)).toEqual({
      currentStage: 'remediation',
      completedStages: 4,
      totalStages: 6,
      percentage: 67,
    })
  })
})
