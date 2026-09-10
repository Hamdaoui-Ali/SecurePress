import { Check, Play } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { ValidationStatus } from '../../domain/models'

export interface HardeningControlDefinition {
  id: string
  title: string
  description: string
  expectedResult: string
}

interface HardeningControlProps {
  control: HardeningControlDefinition
  completed: boolean
  status: ValidationStatus
  busy: boolean
  auditCompleted: boolean
  onRun: () => void
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
        <StatusBadge
          label={status === 'target_validation_required'
            ? 'Target verification required'
            : status === 'simulated_pass' ? 'PASS'
              : status === 'simulated_fail' ? 'FAIL' : 'Prêt à exécuter'}
          tone={status === 'simulated_pass' ? 'success' : status === 'simulated_fail' ? 'critical' : 'prepared'}
        />
      </div>
      <p>{control.description}</p>
      <div className="hardening-control-expected">
        <span>Résultat attendu</span>
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
