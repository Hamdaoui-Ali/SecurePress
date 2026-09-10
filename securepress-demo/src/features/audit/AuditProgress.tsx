import type { ProgressUpdate } from '../../services/simulation-engine'

interface AuditProgressProps {
  completed: boolean
  running: boolean
  progress: ProgressUpdate | null
}

export function AuditProgress({
  completed,
  running,
  progress,
}: AuditProgressProps) {
  const message = running
    ? progress?.step ?? 'Finding analysis queued'
    : completed
      ? 'Finding analysis completed'
      : 'Ready to analyze findings'

  return (
    <div className="audit-progress" aria-live="polite">
      <span className="progress-pulse" aria-hidden="true" />
      <strong>{message}</strong>
      {running && progress ? <span>{progress.percent}%</span> : null}
    </div>
  )
}
