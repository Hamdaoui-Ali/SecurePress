import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Link } from 'react-router'
import { useAssessment } from '../../app/AssessmentProvider'
import { Card } from '../../components/ui/Card'
import { telcoScenario } from '../../data/scenario'
import {
  isControlCampaignComplete,
  selectAppliedCount,
  selectNextWorkflowAction,
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

function operationActivity(
  lastRun: ReturnType<typeof useAssessment>['lastRun'],
) {
  if (!lastRun) return <p className="muted-copy">No workspace operation has completed yet.</p>

  return (
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
  )
}

export function OverviewPage() {
  const { state, lastRun } = useAssessment()
  const hasInventory = state.inventoryCompleted
  const hasAudit = state.auditCompleted
  const hasControlCampaign = isControlCampaignComplete(state)
  const severityCounts = selectSeverityCounts(telcoScenario)
  const appliedCount = selectAppliedCount(state)
  const postureScore = selectPostureScore(telcoScenario, state)
  const remainingRiskPoints = selectRemainingRiskPoints(telcoScenario, state)
  const postureStatus =
    appliedCount > 0
      ? 'Projected, target verification required'
      : 'Assessment baseline'
  const componentCount = telcoScenario.inventory.components.length
  const nextAction = selectNextWorkflowAction(state)

  return (
    <div className="page-stack" data-guide-id="overview">
      <div className="page-heading">
        <p className="eyebrow">WORKSPACE OVERVIEW</p>
        <h2>{hasAudit ? 'Assess workspace posture' : 'Build the workspace assessment'}</h2>
        <p>
          {hasAudit
            ? `Review the indexed ${telcoScenario.project.name} package, qualified findings, and required target verification before making a change.`
            : 'Complete each operation in order. SecurePress reveals the evidence produced by the current step and keeps the next action clear.'}
        </p>
      </div>

      <Card title="Source verified" eyebrow="LOCAL SOURCE" className="source-overview-card">
        <div className="source-overview-summary">
          <strong>{state.source.displayName || 'Local WordPress source'}</strong>
          <span>{state.source.pathLabel || 'Selected local source package'}</span>
          <p>Source evidence is ready. No website was contacted.</p>
          <p>Evidence will appear as each operation completes.</p>
        </div>
      </Card>

      <div className="overview-grid overview-grid-primary">
        <Card title="Workspace workflow" eyebrow="OPERATIONS">
          <WorkflowStepper state={state} />
        </Card>
        <Card title="Next action" eyebrow="FOLLOW THE WORKFLOW">
          <div className="overview-next-action">
            <p className="posture-status">{nextAction.label}</p>
            <p>
              {hasControlCampaign
                ? 'All local operations are complete. Review the evidence trail before presenting the report.'
                : 'Continue with the next operation to unlock the next evidence layer.'}
            </p>
            <Link className="button button-primary overview-next-action-link" to={nextAction.to}>
              {nextAction.label}
            </Link>
          </div>
          {lastRun ? <div className="overview-activity">{operationActivity(lastRun)}</div> : null}
        </Card>
      </div>

      {hasInventory ? (
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
          {hasAudit ? (
            <>
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
            </>
          ) : null}
        </div>
      ) : null}

      {hasAudit ? (
        <>
          <div className="overview-grid">
            <Card title="Security posture score" eyebrow="POSTURE">
              <PostureGauge
                score={postureScore}
                remainingRiskPoints={remainingRiskPoints}
                status={postureStatus}
              />
            </Card>
            <Card title="Workspace activity" eyebrow="RECENT OPERATION">
              {operationActivity(lastRun)}
              <p className="card-note">
                Next action: <strong>{nextAction.label}</strong>
              </p>
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
                Severity describes the workspace evidence and does not establish exploitability on a
                target.
              </p>
            </Card>
            <Card title="Evidence limits" eyebrow="TARGET VERIFICATION">
              <EvidenceLimits />
            </Card>
          </div>
        </>
      ) : (
        <Card title="Evidence limits" eyebrow="TARGET VERIFICATION">
          <EvidenceLimits />
        </Card>
      )}
    </div>
  )
}

function EvidenceLimits() {
  return (
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
  )
}
