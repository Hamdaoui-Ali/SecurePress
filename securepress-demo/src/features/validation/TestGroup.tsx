import type { ValidationCheck, ValidationStatus } from '../../domain/models'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface TestGroupProps {
  title: string
  description: string
  checks?: ValidationCheck[]
  results: Record<string, ValidationStatus>
  emptyMessage?: string
}

function statusLabel(status: ValidationStatus | undefined) {
  switch (status) {
    case 'simulated_pass':
      return 'PASS simulé'
    case 'simulated_fail':
      return 'ÉCHEC simulé'
    case 'target_validation_required':
      return 'Validation cible requise'
    case 'dynamic_retest_not_executed':
      return 'Contre-audit non exécuté'
    default:
      return 'En attente'
  }
}

function statusTone(status: ValidationStatus | undefined) {
  if (status === 'simulated_pass') return 'success' as const
  if (status === 'simulated_fail') return 'critical' as const
  return 'prepared' as const
}

export function TestGroup({
  title,
  description,
  checks = [],
  results,
  emptyMessage,
}: TestGroupProps) {
  return (
    <section className="validation-group" aria-labelledby={`validation-group-${title}`}>
      <div className="validation-group-header">
        <div>
          <h3 id={`validation-group-${title}`}>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="validation-group-count">
          {checks.length > 0
            ? `${checks.length} test${checks.length > 1 ? 's' : ''}`
            : 'Repère'}
        </span>
      </div>
      {checks.length > 0 ? (
        <div className="validation-check-list">
          {checks.map((check) => {
            const status = results[check.id] ?? check.initialStatus
            return (
              <div className="validation-check-row" key={check.id}>
                <div>
                  <strong>{check.title}</strong>
                  <span>{check.expectedResult}</span>
                </div>
                <StatusBadge label={statusLabel(status)} tone={statusTone(status)} />
              </div>
            )
          })}
        </div>
      ) : (
        <p className="validation-empty-group">
          {emptyMessage ?? 'Aucun contrôle local supplémentaire dans cette démo.'}
        </p>
      )}
    </section>
  )
}
