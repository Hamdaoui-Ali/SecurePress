import type {
  AssessmentState,
  ComponentRecord,
  Finding,
  OperationRun,
  ValidationCheck,
} from './models'
import type { ProgressUpdate } from '../services/simulation-engine'

function visibleCount(
  length: number,
  operation: OperationRun | null,
  progress: ProgressUpdate | null,
  kind: OperationRun['kind'],
  completed: boolean,
): number {
  if (completed || operation?.kind !== kind || operation.status !== 'running') {
    return length
  }

  return Math.min(length, Math.max(0, progress?.processed ?? 0))
}

export function selectVisibleComponents(
  components: ComponentRecord[],
  activeOperation: OperationRun | null,
  progress: ProgressUpdate | null,
  completed: boolean,
): ComponentRecord[] {
  return components.slice(
    0,
    visibleCount(components.length, activeOperation, progress, 'discovery', completed),
  )
}

export function selectVisibleFindings(
  findings: Finding[],
  activeOperation: OperationRun | null,
  progress: ProgressUpdate | null,
  completed: boolean,
): Finding[] {
  return findings.slice(
    0,
    visibleCount(findings.length, activeOperation, progress, 'analysis', completed),
  )
}

export type CampaignCheckState = 'queued' | 'running' | 'pass' | 'target'

function completedCampaignState(check: ValidationCheck, state: AssessmentState): CampaignCheckState {
  const result = state.validationResults[check.id] ?? check.initialStatus
  return result === 'target_validation_required' ? 'target' : result === 'simulated_pass' ? 'pass' : 'queued'
}

export function selectCampaignCheckState(
  checks: ValidationCheck[],
  state: AssessmentState,
  activeOperation: OperationRun | null,
  progress: ProgressUpdate | null,
): Record<string, CampaignCheckState> {
  const isCampaignRunning =
    activeOperation?.kind === 'controls' &&
    activeOperation.status === 'running' &&
    activeOperation.message === 'Control campaign in progress'

  if (!isCampaignRunning) {
    return Object.fromEntries(
      checks.map((check) => [check.id, completedCampaignState(check, state)]),
    )
  }

  const processed = Math.min(checks.length, Math.max(0, progress?.processed ?? 0))
  return Object.fromEntries(
    checks.map((check, index) => [
      check.id,
      index < processed
        ? check.initialStatus === 'target_validation_required' ? 'target' : 'pass'
        : index === processed
          ? 'running'
          : 'queued',
    ]),
  )
}
