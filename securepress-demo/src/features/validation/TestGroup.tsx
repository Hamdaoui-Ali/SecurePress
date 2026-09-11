import type { ValidationCheck, ValidationStatus } from '../../domain/models'
import type { CampaignCheckState } from '../../domain/operation-view'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface TestGroupProps {
  title: string
  description: string
  checks?: ValidationCheck[]
  results: Record<string, ValidationStatus | CampaignCheckState>
  emptyMessage?: string
}

function statusLabel(status: ValidationStatus | CampaignCheckState | undefined) {
  switch (status) {
    case 'pass':
    case 'simulated_pass':
      return 'PASS'
    case 'target':
    case 'target_validation_required':
      return 'Target verification required'
    case 'running':
      return 'Running'
    case 'queued':
      return 'Queued'
    case 'simulated_fail':
      return 'FAIL'
    case 'dynamic_retest_not_executed':
      return 'Dynamic retest not executed'
    default:
      return 'Not run'
  }
}

function statusTone(status: ValidationStatus | CampaignCheckState | undefined) {
  if (status === 'simulated_pass' || status === 'pass') return 'success' as const
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
            : 'Reference'}
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
          {emptyMessage ?? 'No additional local controls are defined for this workspace.'}
        </p>
      )}
    </section>
  )
}
