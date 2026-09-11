import { Download, Printer, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import {
  isControlCampaignComplete,
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
import { downloadReportPdf } from '../../services/report-pdf'

export function ReportPage() {
  const { state } = useAssessment()
  const campaignComplete = isControlCampaignComplete(state)

  if (!campaignComplete) {
    const nextAction = state.auditCompleted
      ? {
          label: 'Run control campaign',
          to: '/validation',
          title: 'Controls required before final report',
          message:
            'Finding analysis is complete. Run the local control campaign before generating the printable or downloadable report.',
        }
      : state.inventoryCompleted
        ? {
            label: 'Continue to finding analysis',
            to: '/audit',
            title: 'Complete finding analysis first',
            message:
              'The report can only summarize evidence after discovery and finding analysis have completed.',
          }
        : {
            label: 'Continue to discovery',
            to: '/inventaire',
            title: 'Complete discovery first',
            message:
              'Choose a verified source, index the package, and analyze its findings before opening the final report.',
          }

    return (
      <div className="page-stack report-page" data-guide-id="review-comparison">
        <div className="page-heading">
          <p className="eyebrow">STEP 6 · REPORT</p>
          <h2>Report pending</h2>
          <p>
            SecurePress keeps the final report closed until the evidence-producing operations are
            complete.
          </p>
        </div>

        <Card title={nextAction.title} eyebrow="REPORT STATUS">
          <div className="report-pending-state">
            <p>{nextAction.message}</p>
            <Link className="button button-primary" to={nextAction.to}>
              {nextAction.label}
            </Link>
          </div>
        </Card>

        <Card title="What the final report will contain" eyebrow="EVIDENCE BOUNDARY">
          <ul className="report-pending-list">
            <li>Indexed source evidence and qualified findings</li>
            <li>Applied change sets and projected posture</li>
            <li>Control results with target-verification limits</li>
          </ul>
        </Card>
      </div>
    )
  }

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
      ? 'High risk from indexed evidence'
      : remainingRiskPoints > 0
        ? 'Residual risk remains'
        : 'No residual risk in the change set'

  return (
    <div className="page-stack report-page" data-guide-id="review-comparison">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">STEP 6 · REPORT</p>
          <h2>Compare, explain, and leave an evidence trail</h2>
          <p>
            This summary is recalculated from the indexed {telcoScenario.project.name} source package
            and the workspace operations recorded in this session.
          </p>
        </div>
        <div className="report-actions">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            data-guide-id="finish-report"
          >
            <Printer aria-hidden="true" size={16} />
            Print report
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadReportPdf({
                scenario: telcoScenario,
                state,
                generatedAt: new Date(),
              })
            }
          >
            <Download aria-hidden="true" size={16} />
            Download report
          </Button>
        </div>
      </div>

      <div className="report-disclaimer" role="note">
        <ShieldCheck aria-hidden="true" size={19} />
        <div>
          <strong>Report grounded in indexed local evidence</strong>
          <span>
            Findings come from the indexed {telcoScenario.project.name} source package; change sets
            are generated in the workspace; target verification remains pending.
          </span>
        </div>
        <StatusBadge
          label="External dynamic retest — NOT EXECUTED"
          tone="prepared"
        />
      </div>

      <Card title="Posture summary" eyebrow="CALCULATED SUMMARY">
        <div className="report-summary-grid">
          <div>
            <span>Calculated posture</span>
            <strong>{postureScore} / 100</strong>
          </div>
          <div>
            <span>Qualified scope</span>
            <strong>{totalFindings} qualified findings</strong>
          </div>
          <div>
            <span>Change sets</span>
            <strong>
              {appliedCount === 0
                ? 'No change set applied'
                : appliedCount === 1
                  ? '1 change set applied'
                  : appliedCount + ' change sets applied'}
            </strong>
          </div>
          <div>
            <span>Risk qualification</span>
            <strong>{riskLabel}</strong>
            <small>{remainingRiskPoints} points remain open</small>
          </div>
        </div>
      </Card>

      <section className="report-section" aria-labelledby="comparison-title">
        <div className="report-section-heading">
          <div>
            <p className="eyebrow">BEFORE / AFTER</p>
            <h2 id="comparison-title">Comparison of the ten findings</h2>
          </div>
          <span className="report-section-note">{totalFindings} scenario-linked rows</span>
        </div>
        <ComparisonTable scenario={telcoScenario} state={state} />
      </section>

      <ResidualRisk findings={residualFindings} riskPoints={remainingRiskPoints} />
      <AssessmentTimeline events={state.timeline} />
    </div>
  )
}
