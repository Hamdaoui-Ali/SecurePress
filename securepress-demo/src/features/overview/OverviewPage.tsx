import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import {
  selectAppliedCount,
  selectPostureScore,
  selectRemainingRiskPoints,
  selectSeverityCounts,
} from '../../domain/selectors'
import { Card } from '../../components/ui/Card'
import { MetricCard } from './MetricCard'
import { PostureGauge } from './PostureGauge'
import { WorkflowStepper } from './WorkflowStepper'

export function OverviewPage() {
  const { state } = useAssessment()
  const severityCounts = selectSeverityCounts(telcoScenario)
  const appliedCount = selectAppliedCount(state)
  const postureScore = selectPostureScore(telcoScenario, state)
  const remainingRiskPoints = selectRemainingRiskPoints(telcoScenario, state)
  const postureStatus =
    appliedCount > 0 ? 'Projeté, non vérifié sur cible' : 'État initial simulé'

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">PÉRIMÈTRE & POSTURE</p>
        <h2>Comprendre la copie avant de corriger</h2>
        <p>
          Une lecture rapide de l’audit statique TELCO : ce qui est présent dans
          les fichiers, ce qui est qualifié et ce qui reste à vérifier sur cible.
        </p>
      </div>

      <div className="metric-grid">
        <MetricCard
          label="Extensions identifiées"
          value={telcoScenario.inventory.pluginCount}
          detail="Présence confirmée dans les fichiers"
          tone="blue"
        />
        <MetricCard
          label="Thèmes inventoriés"
          value={telcoScenario.inventory.themeCount}
          detail="Activation non déduite hors base"
          tone="blue"
        />
        <MetricCard
          label="Constats qualifiés"
          value={telcoScenario.findings.length}
          detail={`${appliedCount} remédiation${appliedCount > 1 ? 's' : ''} simulée${appliedCount > 1 ? 's' : ''}`}
          tone="orange"
        />
        <MetricCard
          label="Constats critiques"
          value={severityCounts.critical}
          detail="Priorité de la démonstration"
          tone="red"
        />
      </div>

      <div className="overview-grid">
        <Card title="Indice pédagogique simulé" eyebrow="POSTURE">
          <PostureGauge
            score={postureScore}
            remainingRiskPoints={remainingRiskPoints}
            status={postureStatus}
          />
        </Card>
        <Card title="Progression du workflow" eyebrow="SOUTENANCE">
          <WorkflowStepper state={state} />
        </Card>
      </div>

      <div className="overview-grid overview-grid-bottom">
        <Card title="Répartition des constats" eyebrow="QUALIFICATION">
          <div className="severity-strip" aria-label="Répartition par sévérité">
            <div className="severity-item severity-item-critical">
              <span>Critiques</span>
              <strong>{severityCounts.critical}</strong>
            </div>
            <div className="severity-item severity-item-high">
              <span>Élevés</span>
              <strong>{severityCounts.high}</strong>
            </div>
            <div className="severity-item severity-item-medium">
              <span>Moyens</span>
              <strong>{severityCounts.medium}</strong>
            </div>
            <div className="severity-item severity-item-neutral">
              <span>Faible / variable</span>
              <strong>{severityCounts.low + severityCounts.variable}</strong>
            </div>
          </div>
          <p className="card-note">
            Les sévérités décrivent le scénario pédagogique, pas une exploitabilité
            démontrée sur un serveur réel.
          </p>
        </Card>
        <Card title="Limites à garder visibles" eyebrow="VÉRITÉ DE LA PREUVE">
          <ul className="limit-list">
            <li>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>Audit statique</span>
            </li>
            <li>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>Copie hors production</span>
            </li>
            <li>
              <Info aria-hidden="true" size={17} />
              <span>Activation des extensions inconnue</span>
            </li>
            <li>
              <AlertTriangle aria-hidden="true" size={17} />
              <span>Contre-audit dynamique non exécuté</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
