import type { ComponentRecord, Finding, OperationRun } from './models'
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
