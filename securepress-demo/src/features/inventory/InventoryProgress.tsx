import type { ProgressUpdate } from '../../services/simulation-engine'

const steps = [
  'Read TELCO source package',
  'Index WordPress core',
  'Inventory themes',
  'Inventory plugins',
  'Review configuration',
  'Component summary',
]

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
      <ol className="inventory-step-list">
        {steps.map((step, index) => (
          <li
            key={step}
            className={
              completed || (running && (progress?.percent ?? 0) >= (index + 1) * 15)
                ? 'inventory-step inventory-step-done'
                : 'inventory-step'
            }
          >
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}
