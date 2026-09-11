import type { Finding } from '../../domain/models'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface ResidualRiskProps {
  findings: Finding[]
  riskPoints: number
}
export function ResidualRisk({ findings, riskPoints }: ResidualRiskProps) {
  return (
    <section className="residual-risk-panel" aria-labelledby="residual-risk-title">
      <div className="report-section-heading">
        <div>
          <p className="eyebrow">AFTER CHANGE SETS</p>
          <h2 id="residual-risk-title">Residual risk requiring confirmation</h2>
        </div>
        <StatusBadge
          label={riskPoints > 0 ? 'Residual risk remains' : 'No residual risk in the change set'}
          tone={riskPoints > 0 ? 'prepared' : 'success'}
        />
      </div>
      <div className="residual-risk-summary">
        <strong>{findings.length} findings remain to be confirmed</strong>
        <span>{riskPoints} residual-risk points</span>
      </div>
      {findings.length > 0 ? (
        <ul className="residual-risk-list">
          {findings.map((finding) => (
            <li key={finding.id}>
              <div>
                <strong>{finding.id} · {finding.title}</strong>
                <span>{finding.sourceNote}</span>
              </div>
              <div className="residual-risk-badges">
                <SeverityBadge severity={finding.severity} />
                <span>{finding.riskPoints} pts</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="timeline-empty">No findings remain in the proposed change set.</p>
      )}
    </section>
  )
}
