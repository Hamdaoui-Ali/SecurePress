import type { ProgressUpdate } from '../../services/simulation-engine'

interface InventoryProgressProps {
  completed: boolean
  running: boolean
  progress: ProgressUpdate | null
}

export function InventoryProgress({
  completed,
  running,
  progress,
}: InventoryProgressProps) {
  const liveMessage = running
    ? progress?.step ?? 'Discovery queued'
    : completed
      ? 'Workspace ready'
      : 'Ready to run discovery'

  return (
    <div className="inventory-progress">
      <div className="inventory-progress-live" aria-live="polite">
        <span className="progress-pulse" aria-hidden="true" />
        <strong>{liveMessage}</strong>
        {progress && running ? <span>{progress.percent}%</span> : null}
      </div>
      <div className="inventory-progress-count">
        {running && progress
          ? `${progress.processed} of ${progress.total} components processed`
          : completed
            ? '22 of 22 components processed'
            : 'No components indexed yet'}
      </div>
    </div>
  )
}
