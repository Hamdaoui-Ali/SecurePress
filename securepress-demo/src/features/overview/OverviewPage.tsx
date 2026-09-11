import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { Card } from '../../components/ui/Card'
import { telcoScenario } from '../../data/scenario'
import {
  selectAppliedCount,
  selectPostureScore,
  selectRemainingRiskPoints,
  selectSeverityCounts,
} from '../../domain/selectors'
import { MetricCard } from './MetricCard'
import { PostureGauge } from './PostureGauge'
import { WorkflowStepper } from './WorkflowStepper'

function formatDuration(durationMs: number | undefined): string {
  const seconds = Math.max(0, Math.round((durationMs ?? 0) / 1000))
  const minutes = Math.floor(seconds / 60)

  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
}

function nextAction(inventoryCompleted: boolean, auditCompleted: boolean): string {
  if (!inventoryCompleted) return 'Run discovery'
  if (!auditCompleted) return 'Analyze findings'
  return 'Review change sets'
}

export function OverviewPage() {
  const { state, lastRun } = useAssessment()
  const severityCounts = selectSeverityCounts(telcoScenario)
  const appliedCount = selectAppliedCount(state)
  const postureScore = selectPostureScore(telcoScenario, state)
  const remainingRiskPoints = selectRemainingRiskPoints(telcoScenario, state)
  const postureStatus =
    appliedCount > 0
      ? 'Projected, target verification required'
      : 'Assessment baseline'
  const componentCount = telcoScenario.inventory.components.length

  return (
    <div className="page-stack" data-guide-id="overview">
      <div className="page-heading">
        <p className="eyebrow">WORKSPACE OVERVIEW</p>
        <h2>Assess workspace posture</h2>
        <p>
          Review the indexed {telcoScenario.project.name} package, qualified findings, and required
          target verification before making a change.
        </p>
      </div>

      <div className="metric-grid">
        <MetricCard
          label="Indexed components"
          value={componentCount}
          detail="Source package inventory"
          tone="blue"
        />
        <MetricCard
          label={`${telcoScenario.project.name} source package`}
          value="Indexed"
          detail={`WordPress ${telcoScenario.project.wordpressVersion}`}
          tone="blue"
        />
        <MetricCard
          label="Findings available"
          value={telcoScenario.findings.length}
          detail={`${appliedCount} change set${appliedCount === 1 ? '' : 's'} applied`}
          tone="orange"
        />
        <MetricCard
          label="Critical findings"
          value={severityCounts.critical}
          detail="Prioritize for change review"
          tone="red"
        />
      </div>

      <div className="overview-grid">
        <Card title="Security posture score" eyebrow="POSTURE">
          <PostureGauge
            score={postureScore}
            remainingRiskPoints={remainingRiskPoints}
            status={postureStatus}
          />
        </Card>
        <Card title="Workspace workflow" eyebrow="OPERATIONS">
          <WorkflowStepper state={state} />
        </Card>
      </div>

      <div className="overview-grid overview-grid-bottom">
        <Card title="Finding distribution" eyebrow="ANALYSIS">
          <div className="severity-strip" aria-label="Finding severity distribution">
            <div className="severity-item severity-item-critical">
              <span>Critical</span>
              <strong>{severityCounts.critical}</strong>
            </div>
            <div className="severity-item severity-item-high">
              <span>High</span>
              <strong>{severityCounts.high}</strong>
            </div>
            <div className="severity-item severity-item-medium">
              <span>Medium</span>
              <strong>{severityCounts.medium}</strong>
            </div>
            <div className="severity-item severity-item-neutral">
              <span>Low / variable</span>
              <strong>{severityCounts.low + severityCounts.variable}</strong>
            </div>
          </div>
          <p className="card-note">
            Severity describes the workspace evidence and does not establish
            exploitability on a target.
          </p>
        </Card>
        <Card title="Workspace activity" eyebrow="NEXT ACTION">
          {lastRun ? (
            <div className="posture-copy">
              <p className="posture-status">{lastRun.message}</p>
              <p>
                Last run{' '}
                <time dateTime={lastRun.completedAt ?? lastRun.startedAt}>
                  {new Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(lastRun.completedAt ?? lastRun.startedAt))}
                </time>
              </p>
              {lastRun.completedAt ? (
                <p>Completed in {formatDuration(lastRun.durationMs)}</p>
              ) : null}
            </div>
          ) : (
            <p className="muted-copy">No workspace operation has completed yet.</p>
          )}
          <p className="card-note">
            Next action: <strong>{nextAction(state.inventoryCompleted, state.auditCompleted)}</strong>
          </p>
        </Card>
        <Card title="Evidence limits" eyebrow="TARGET VERIFICATION">
          <ul className="limit-list">
            <li>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>Static package analysis</span>
            </li>
            <li>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>Indexed source package</span>
            </li>
            <li>
              <Info aria-hidden="true" size={17} />
              <span>Plugin activation is unknown</span>
            </li>
            <li>
              <AlertTriangle aria-hidden="true" size={17} />
              <span>Dynamic target retest not executed</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
