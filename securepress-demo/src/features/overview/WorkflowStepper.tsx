import type { AssessmentState, WorkflowStage } from '../../domain/models'
import { selectWorkflowProgress } from '../../domain/selectors'

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
  const progress = selectWorkflowProgress(state)

  return (
    <ol className="workflow-stepper" aria-label="Workspace workflow progress">
      {stages.map((stage, index) => {
        const isCurrent = stage.id === progress.currentStage
        const isDone = index < progress.completedStages - 1

        return (
          <li
            key={stage.id}
            className={
              isCurrent
                ? 'workflow-step workflow-step-current'
                : isDone
                  ? 'workflow-step workflow-step-done'
                  : 'workflow-step'
            }
          >
            <span className="workflow-step-marker">{index + 1}</span>
            <span>
              <strong>{stage.label}</strong>
              <small>{isCurrent ? 'Current' : isDone ? 'Completed' : 'Pending'}</small>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
