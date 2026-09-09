import { Printer, ShieldCheck } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import {
  selectAppliedCount,
  selectPostureScore,
  selectRemainingRiskPoints,
} from '../../domain/selectors'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ComparisonTable } from './ComparisonTable'
import { AssessmentTimeline } from './AssessmentTimeline'
import { ResidualRisk } from './ResidualRisk'

export function ReportPage() {
  const { state } = useAssessment()
  const appliedCount = selectAppliedCount(state)
  const postureScore = selectPostureScore(telcoScenario, state)
  const remainingRiskPoints = selectRemainingRiskPoints(telcoScenario, state)
  const totalFindings = telcoScenario.findings.length
  const residualFindings = telcoScenario.findings.filter(
    (finding) => !state.appliedFindingIds.includes(finding.id),
  )
  const totalRiskPoints = telcoScenario.findings.reduce(
    (total, finding) => total + finding.riskPoints,
    0,
  )
  const riskLabel =
    remainingRiskPoints === totalRiskPoints
      ? 'Risque élevé simulé'
      : remainingRiskPoints > 0
        ? 'Risque résiduel non nul'
        : 'Risque résiduel nul'

  return (
    <div className="page-stack report-page" data-guide-id="review-comparison">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">ÉTAPE 6 · RAPPORT</p>
          <h2>Comparer, expliquer et laisser une trace</h2>
          <p>
            La synthèse est recalculée depuis le scénario TELCO et l’état courant
            de la démonstration.
          </p>
        </div>
        <div className="report-actions">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            data-guide-id="finish-report"
          >
            <Printer aria-hidden="true" size={16} />
            Imprimer le rapport
          </Button>
        </div>
      </div>

      <div className="report-disclaimer" role="note">
        <ShieldCheck aria-hidden="true" size={19} />
        <div>
          <strong>Rapport généré depuis un environnement local simulé</strong>
          <span>Aucun serveur réel n’a été évalué par cette application</span>
        </div>
        <StatusBadge
          label="Contre-audit dynamique externe — NON EXÉCUTÉ"
          tone="prepared"
        />
      </div>

      <Card title="Synthèse de posture" eyebrow="RÉSUMÉ CALCULÉ">
        <div className="report-summary-grid">
          <div>
            <span>Posture pédagogique</span>
            <strong>{postureScore} / 100</strong>
          </div>
          <div>
            <span>Périmètre qualifié</span>
            <strong>{totalFindings} constats qualifiés</strong>
          </div>
          <div>
            <span>Remédiations</span>
            <strong>
              {appliedCount === 0
                ? 'Aucune remédiation appliquée'
                : `${appliedCount} remédiations simulées`}
            </strong>
          </div>
          <div>
            <span>Qualification du risque</span>
            <strong>{riskLabel}</strong>
            <small>{remainingRiskPoints} points encore ouverts</small>
          </div>
        </div>
      </Card>

      <section className="report-section" aria-labelledby="comparison-title">
        <div className="report-section-heading">
          <div>
            <p className="eyebrow">AVANT / APRÈS</p>
            <h2 id="comparison-title">Comparaison des dix constats</h2>
          </div>
          <span className="report-section-note">{totalFindings} lignes liées au scénario</span>
        </div>
        <ComparisonTable scenario={telcoScenario} state={state} />
      </section>

      <ResidualRisk findings={residualFindings} riskPoints={remainingRiskPoints} />
      <AssessmentTimeline events={state.timeline} />
    </div>
  )
}
