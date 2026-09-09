import type {
  AssessmentState,
  Scenario,
  Severity,
  WorkflowStage,
} from './models'

export type SeverityCounts = Record<Severity, number>

export interface WorkflowProgress {
  currentStage: WorkflowStage
  completedStages: number
  totalStages: number
  percentage: number
}

const workflowStages: WorkflowStage[] = [
  'overview',
  'inventory',
  'audit',
  'remediation',
  'validation',
  'report',
]

export function selectSeverityCounts(scenario: Scenario): SeverityCounts {
  const counts: SeverityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    variable: 0,
  }

  for (const finding of scenario.findings) {
    counts[finding.severity] += 1
  }

  return counts
}

export function selectAppliedCount(state: AssessmentState): number {
  return state.appliedFindingIds.length
}

export function selectRemainingRiskPoints(
  scenario: Scenario,
  state: AssessmentState,
): number {
  return scenario.findings
    .filter((finding) => !state.appliedFindingIds.includes(finding.id))
    .reduce((total, finding) => total + finding.riskPoints, 0)
}

export function selectPostureScore(
  scenario: Scenario,
  state: AssessmentState,
): number {
  return Math.max(0, 100 - selectRemainingRiskPoints(scenario, state))
}

export function selectWorkflowProgress(state: AssessmentState): WorkflowProgress {
  const currentIndex = workflowStages.indexOf(state.stage)
  const completedStages = Math.max(1, currentIndex + 1)
  const totalStages = workflowStages.length

  return {
    currentStage: state.stage,
    completedStages,
    totalStages,
    percentage: Math.round((completedStages / totalStages) * 100),
  }
}
