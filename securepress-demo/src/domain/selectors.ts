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

export type WorkflowStepStatus =
  | 'current'
  | 'completed'
  | 'available'
  | 'locked'

export interface WorkflowStepState {
  status: WorkflowStepStatus
  reason?: string
}

export interface WorkflowAction {
  label: string
  to: string
}

const workflowStages: WorkflowStage[] = [
  'overview',
  'inventory',
  'audit',
  'remediation',
  'validation',
  'report',
]

export function isControlCampaignComplete(state: AssessmentState): boolean {
  return state.validationResults['external-dynamic-retest'] ===
    'dynamic_retest_not_executed'
}

function currentWorkflowStage(state: AssessmentState): WorkflowStage {
  if (isControlCampaignComplete(state)) return 'report'
  if (state.stage === 'validation' || state.completedHardeningCheckIds.length > 0) {
    return 'validation'
  }
  if (state.stage === 'remediation' || state.appliedFindingIds.length > 0) {
    return 'remediation'
  }
  if (state.auditCompleted || state.stage === 'audit') return 'audit'
  if (state.inventoryCompleted || state.stage === 'inventory') return 'inventory'
  return 'overview'
}

function isWorkflowStepUnlocked(
  state: AssessmentState,
  stage: WorkflowStage,
): boolean {
  switch (stage) {
    case 'overview':
      return state.source.status === 'ready'
    case 'inventory':
      return state.source.status === 'ready'
    case 'audit':
      return state.inventoryCompleted
    case 'remediation':
      return state.auditCompleted
    case 'validation':
      return state.auditCompleted
    case 'report':
      return isControlCampaignComplete(state)
  }
}

function workflowStepLockReason(stage: WorkflowStage): string | undefined {
  switch (stage) {
    case 'overview':
      return 'Verify a source first'
    case 'inventory':
      return 'Verify a source first'
    case 'audit':
      return 'Complete discovery first'
    case 'remediation':
      return 'Complete finding analysis first'
    case 'validation':
      return 'Complete finding analysis first'
    case 'report':
      return 'Run the control campaign first'
  }
}

export function selectWorkflowStep(
  state: AssessmentState,
  stage: WorkflowStage,
): WorkflowStepState {
  const currentStage = currentWorkflowStage(state)
  const currentIndex = workflowStages.indexOf(currentStage)
  const stageIndex = workflowStages.indexOf(stage)

  if (stageIndex < currentIndex) return { status: 'completed' }
  if (stageIndex === currentIndex) return { status: 'current' }
  if (isWorkflowStepUnlocked(state, stage)) return { status: 'available' }

  return {
    status: 'locked',
    reason: workflowStepLockReason(stage),
  }
}

export function selectNextWorkflowAction(state: AssessmentState): WorkflowAction {
  if (!state.inventoryCompleted) {
    return { label: 'Start discovery', to: '/inventaire' }
  }
  if (!state.auditCompleted) {
    return { label: 'Analyze findings', to: '/audit' }
  }
  if (state.appliedFindingIds.length === 0) {
    return { label: 'Review change sets', to: '/remediation' }
  }
  if (!isControlCampaignComplete(state)) {
    return { label: 'Run controls', to: '/validation' }
  }
  return { label: 'Review report', to: '/rapport' }
}

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
  const currentIndex = workflowStages.indexOf(currentWorkflowStage(state))
  const completedStages = Math.max(1, currentIndex + 1)
  const totalStages = workflowStages.length

  return {
    currentStage: state.stage,
    completedStages,
    totalStages,
    percentage: Math.round((completedStages / totalStages) * 100),
  }
}
