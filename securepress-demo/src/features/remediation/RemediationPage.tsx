import { ShieldCheck } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import { selectPostureScore } from '../../domain/selectors'
import { Card } from '../../components/ui/Card'
import { RemediationCard } from './RemediationCard'

export function RemediationPage() {
  const { state, busy, applyRemediation } = useAssessment()
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

      <Card title="Posture courante" eyebrow="ÉTAT DE LA SIMULATION">
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
            Les actions ci-dessous modifient uniquement l’état local de la démo.
          </p>
        </div>
      </Card>

      <div className="remediation-grid">
        {telcoScenario.remediations.map((remediation) => {
          const finding = telcoScenario.findings.find(
            (item) => item.id === remediation.findingId,
          )
          if (!finding) return null

          return (
            <RemediationCard
              key={remediation.id}
              finding={finding}
              remediation={remediation}
              applied={state.appliedFindingIds.includes(finding.id)}
              busy={busy}
              auditCompleted={state.auditCompleted}
              onApply={() => void applyRemediation(finding.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
