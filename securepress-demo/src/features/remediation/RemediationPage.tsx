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
          <span>Terminez d’abord l’audit statique simulé</span>
        </div>
      ) : null}

      <Card title="Workspace posture" eyebrow="WORKSPACE STATE">
        <div className="remediation-summary">
          <div>
            <span>Indice pédagogique</span>
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
          const failedRun = isChangeSetForFinding(lastRun, finding.id) && lastRun?.status === 'failed'
          const completedRun = [lastRun, ...state.operationHistory].find(
            (operation) =>
              isChangeSetForFinding(operation, finding.id) &&
              operation?.status === 'completed',
          )
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
