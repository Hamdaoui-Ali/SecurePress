import { ShieldCheck } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import type { OperationRun } from '../../domain/models'
import { selectPostureScore } from '../../domain/selectors'
import { Card } from '../../components/ui/Card'
import { RemediationCard } from './RemediationCard'

function isChangeSetForFinding(
  operation: OperationRun | null,
  findingId: string,
) {
  if (operation?.kind !== 'change-set') return false
  return operation.findingId !== undefined
    ? operation.findingId === findingId
    : operation.message.match(/\bF-\d{3}\b/)?.[0] === findingId
}

function findLatestChangeSetRun(
  operations: Array<OperationRun | null>,
  findingId: string,
) {
  return operations.find((operation) => isChangeSetForFinding(operation, findingId))
}

export function RemediationPage() {
  const { state, busy, progress, activeOperation, lastRun, applyRemediation } = useAssessment()
  const score = selectPostureScore(telcoScenario, state)

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">STEP 4 · REMEDIATION</p>
        <h2>Connect each finding to a correction</h2>
        <p>
          Each card separates the baseline, proposed measure, workspace artifact, and validation
          that still needs to be demonstrated.
        </p>
      </div>

      {!state.auditCompleted ? (
        <div className="prerequisite-banner" role="status">
          <ShieldCheck aria-hidden="true" size={19} />
          <span>Complete finding analysis before preparing a change set</span>
        </div>
      ) : null}

      <Card title="Workspace posture" eyebrow="WORKSPACE STATE">
        <div className="remediation-summary">
          <div>
            <span>Security posture score</span>
            <strong>{score} / 100</strong>
          </div>
          <div>
            <span>Change sets applied</span>
            <strong>{state.appliedFindingIds.length}</strong>
          </div>
          <p>
            Change sets update this workspace record only. Target verification remains required.
          </p>
        </div>
      </Card>

      <div className="remediation-grid">
        {telcoScenario.remediations.map((remediation) => {
          const finding = telcoScenario.findings.find(
            (item) => item.id === remediation.findingId,
          )
          if (!finding) return null

          const isApplying = isChangeSetForFinding(activeOperation, finding.id)
          const isApplied = state.appliedFindingIds.includes(finding.id)
          const latestChangeSetRun = findLatestChangeSetRun(
            [lastRun, ...state.operationHistory],
            finding.id,
          )
          const failedRun = latestChangeSetRun?.status === 'failed'
          const completedRun =
            latestChangeSetRun?.status === 'completed'
              ? latestChangeSetRun
              : undefined
          const changeSetState = isApplied
            ? 'applied'
            : isApplying
              ? 'applying'
              : failedRun
                ? 'failed'
                : 'staged'

          return (
            <RemediationCard
              key={remediation.id}
              finding={finding}
              remediation={remediation}
              changeSetState={changeSetState}
              busy={busy}
              auditCompleted={state.auditCompleted}
              phase={isApplying ? progress?.step : undefined}
              durationMs={completedRun?.durationMs}
              onApply={() => void applyRemediation(finding.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
