import type { AssessmentState, WorkflowStage } from '../../domain/models'
import { selectWorkflowProgress } from '../../domain/selectors'

interface WorkflowStepperProps {
  state: AssessmentState
}

const stages: Array<{ id: WorkflowStage; label: string }> = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'inventory', label: 'Inventaire' },
  { id: 'audit', label: 'Audit' },
  { id: 'remediation', label: 'Remédiation' },
  { id: 'validation', label: 'Validation' },
  { id: 'report', label: 'Rapport' },
]

export function WorkflowStepper({ state }: WorkflowStepperProps) {
  const progress = selectWorkflowProgress(state)

  return (
    <ol className="workflow-stepper" aria-label="Progression du workflow">
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
              <small>
                {isCurrent ? 'Étape actuelle' : isDone ? 'Terminée' : 'À venir'}
              </small>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
