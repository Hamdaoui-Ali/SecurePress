import { describe, expect, test } from 'vitest'
import { telcoScenario } from '../data/scenario'
import { createInitialAssessment, type AssessmentState } from './models'
import {
  isControlCampaignComplete,
  selectAppliedCount,
  selectNextWorkflowAction,
  selectPostureScore,
  selectRemainingRiskPoints,
  selectSeverityCounts,
  selectWorkflowStep,
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

  test('starts the workflow with discovery as the next action and later steps locked', () => {
    const state = createInitialAssessment()

    expect(selectNextWorkflowAction(state)).toEqual({
      label: 'Start discovery',
      to: '/inventaire',
    })
    expect(selectWorkflowStep(state, 'audit')).toMatchObject({
      status: 'locked',
      reason: 'discovery is complete',
    })
  })

  test('unlocks analysis after discovery and corrections after analysis', () => {
    const initial = createInitialAssessment()
    const inventoryState = {
      ...initial,
      source: { ...initial.source, status: 'ready' as const },
      inventoryCompleted: true,
      stage: 'inventory' as const,
    }
    const auditState = {
      ...inventoryState,
      auditCompleted: true,
      stage: 'audit' as const,
    }

    expect(selectWorkflowStep(inventoryState, 'audit')).toMatchObject({
      status: 'available',
    })
    expect(selectNextWorkflowAction(inventoryState)).toEqual({
      label: 'Analyze findings',
      to: '/audit',
    })
    expect(selectWorkflowStep(auditState, 'remediation')).toMatchObject({
      status: 'available',
    })
    expect(selectNextWorkflowAction(auditState)).toEqual({
      label: 'Review change sets',
      to: '/remediation',
    })
  })

  test('moves from corrections to controls and then to the report', () => {
    const initial = createInitialAssessment()
    const state = {
      ...initial,
      source: { ...initial.source, status: 'ready' as const },
      inventoryCompleted: true,
      auditCompleted: true,
      stage: 'remediation' as const,
      appliedFindingIds: ['F-001' as const],
    }
    const campaignState = {
      ...state,
      stage: 'validation' as const,
      validationResults: {
        'external-dynamic-retest': 'dynamic_retest_not_executed' as const,
      },
    }

    expect(selectNextWorkflowAction(state)).toEqual({
      label: 'Run controls',
      to: '/validation',
    })
    expect(selectNextWorkflowAction(campaignState)).toEqual({
      label: 'Review report',
      to: '/rapport',
    })
    expect(isControlCampaignComplete(campaignState)).toBe(true)
    expect(selectWorkflowStep(campaignState, 'report')).toMatchObject({
      status: 'current',
    })
  })
})
