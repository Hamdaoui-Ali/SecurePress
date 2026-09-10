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
  return operation?.kind === 'change-set' && operation.message.includes(findingId)
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
        <p className="eyebrow">ÉTAPE 4 · REMÉDIATION</p>
        <h2>Relier le constat à une correction</h2>
        <p>
          Chaque carte sépare l’état initial, la mesure proposée, l’artefact et
          la validation qui reste à démontrer.
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
            <span>Remédiations appliquées</span>
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
