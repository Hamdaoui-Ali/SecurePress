import type { ProgressUpdate } from '../../services/simulation-engine'

const steps = [
  'Lecture de l’instantané',
  'Détection du noyau',
  'Inspection des thèmes',
  'Inspection des extensions',
  'Inspection de la configuration',
  'Construction de l’inventaire',
]

interface InventoryProgressProps {
  completed: boolean
  busy: boolean
  progress: ProgressUpdate | null
}

export function InventoryProgress({
  completed,
  busy,
  progress,
}: InventoryProgressProps) {
  const liveMessage = busy
    ? progress?.message ?? 'Préparation de l’inventaire simulé'
    : completed
      ? 'Inventaire terminé'
      : 'Prêt à lancer l’inventaire simulé'

  return (
    <div className="inventory-progress">
      <div className="inventory-progress-live" aria-live="polite">
        <span className="progress-pulse" aria-hidden="true" />
        <strong>{liveMessage}</strong>
        {progress && busy ? <span>{progress.percent}%</span> : null}
      </div>
      <ol className="inventory-step-list">
        {steps.map((step, index) => (
          <li
            key={step}
            className={
              completed || (!busy && progress && progress.percent >= (index + 1) * 15)
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
