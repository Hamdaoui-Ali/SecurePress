import { Check, Play } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { ValidationStatus } from '../../domain/models'
import type { CampaignCheckState } from '../../domain/operation-view'

export interface HardeningControlDefinition {
  id: string
  title: string
  description: string
  expectedResult: string
}

interface HardeningControlProps {
  control: HardeningControlDefinition
  completed: boolean
  status: ValidationStatus | CampaignCheckState
  busy: boolean
  auditCompleted: boolean
  onRun: () => void
}

function statusLabel(status: ValidationStatus | CampaignCheckState): string {
  switch (status) {
    case 'simulated_pass':
    case 'pass':
      return 'PASS'
    case 'simulated_fail':
      return 'FAIL'
    case 'target_validation_required':
    case 'target':
      return 'Target verification required'
    case 'running':
      return 'Running'
    case 'queued':
      return 'Queued'
    default:
      return 'Not run'
  }
}

function statusTone(status: ValidationStatus | CampaignCheckState) {
  if (status === 'simulated_pass' || status === 'pass') return 'success' as const
  if (status === 'simulated_fail') return 'critical' as const
  return 'prepared' as const
}

export function HardeningControl({
  control,
  completed,
  status,
  busy,
  auditCompleted,
  onRun,
}: HardeningControlProps) {
  return (
    <article
      className="hardening-control"
      aria-labelledby={`hardening-title-${control.id}`}
    >
      <div className="hardening-control-header">
        <div>
          <p className="validation-control-id">{control.id}</p>
          <h3 id={`hardening-title-${control.id}`}>{control.title}</h3>
        </div>
        <StatusBadge label={statusLabel(status)} tone={statusTone(status)} />
      </div>
      <p>{control.description}</p>
      <div className="hardening-control-expected">
        <span>Expected result</span>
        <strong>{control.expectedResult}</strong>
      </div>
      <div className="hardening-control-footer">
        {completed ? <Check aria-hidden="true" size={16} /> : null}
        <Button
          variant={completed ? 'secondary' : 'primary'}
          disabled={completed || !auditCompleted}
          busy={busy && !completed}
          onClick={onRun}
          data-guide-id={`hardening-${control.id}`}
        >
          <Play aria-hidden="true" size={15} />
          {completed
            ? `Control completed · ${control.title}`
            : `Run control · ${control.title}`}
        </Button>
      </div>
    </article>
  )
}
