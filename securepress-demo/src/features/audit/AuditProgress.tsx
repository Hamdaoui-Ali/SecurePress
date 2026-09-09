import type { ProgressUpdate } from '../../services/simulation-engine'

interface AuditProgressProps {
  completed: boolean
  busy: boolean
  progress: ProgressUpdate | null
}

export function AuditProgress({
  completed,
  busy,
  progress,
}: AuditProgressProps) {
  const message = busy
    ? progress?.message ?? 'Préparation de l’audit statique simulé'
    : completed
      ? 'Audit simulé terminé'
      : 'Prêt à qualifier les constats locaux'

  return (
    <div className="audit-progress" aria-live="polite">
      <span className="progress-pulse" aria-hidden="true" />
      <strong>{message}</strong>
      {busy && progress ? <span>{progress.percent}%</span> : null}
    </div>
  )
}
