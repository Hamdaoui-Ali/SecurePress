import type { AssessmentState, WorkflowStage } from '../../domain/models'
import { selectWorkflowStep } from '../../domain/selectors'

interface WorkflowStepperProps {
  state: AssessmentState
}

const stages: Array<{ id: WorkflowStage; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Discovery' },
  { id: 'audit', label: 'Finding analysis' },
  { id: 'remediation', label: 'Change sets' },
  { id: 'validation', label: 'Controls' },
  { id: 'report', label: 'Report' },
]

export function WorkflowStepper({ state }: WorkflowStepperProps) {
  return (
    <ol className="workflow-stepper" aria-label="Workspace workflow progress">
      {stages.map((stage, index) => {
        const step = selectWorkflowStep(state, stage.id)
        const statusLabel =
          step.status === 'current'
            ? 'Current'
            : step.status === 'completed'
              ? 'Completed'
              : step.status === 'available'
                ? 'Next'
                : `Locked until ${step.reason?.toLowerCase() ?? 'the previous step is complete'}`

        return (
          <li
            key={stage.id}
            className={`workflow-step workflow-step-${step.status}`}
          >
            <span className="workflow-step-marker">{index + 1}</span>
            <span>
              <strong>{stage.label}</strong>
              <small>{statusLabel}</small>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
