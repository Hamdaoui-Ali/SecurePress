import type { AssessmentState, Scenario, ValidationStatus } from '../../domain/models'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface ComparisonTableProps {
  scenario: Scenario
  state: AssessmentState
}

function validationLabel(status: ValidationStatus | undefined) {
  switch (status) {
    case 'simulated_pass':
      return 'PASS'
    case 'simulated_fail':
      return 'FAIL'
    case 'target_validation_required':
      return 'Target verification required'
    case 'dynamic_retest_not_executed':
      return 'Dynamic retest not executed'
    default:
      return 'Not run'
  }
}

function validationTone(status: ValidationStatus | undefined) {
  if (status === 'simulated_pass') return 'success' as const
  if (status === 'simulated_fail') return 'critical' as const
  return 'prepared' as const
}

function limitationLabel(evidenceStatus: string) {
  switch (evidenceStatus) {
    case 'not_observable_offline':
      return 'Target evidence required; not observable locally.'
    case 'documented_in_audit':
      return 'Documented source; artifact requires confirmation.'
    default:
      return 'Local evidence from the offline copy.'
  }
}

export function ComparisonTable({ scenario, state }: ComparisonTableProps) {
  return (
    <div className="table-scroll report-table-scroll">
      <table className="comparison-table" aria-label="Before and after comparison">
        <thead>
          <tr>
            <th scope="col">Control</th>
            <th scope="col">Initial state</th>
            <th scope="col">Proposed hardened state</th>
            <th scope="col">Change set</th>
            <th scope="col">Validation</th>
            <th scope="col">Limit</th>
          </tr>
        </thead>
        <tbody>
          {scenario.findings.map((finding) => {
            const remediation = scenario.remediations.find(
              (item) => item.id === finding.remediationId,
            )
            const check = scenario.validationChecks.find((item) =>
              finding.validationIds.includes(item.id),
            )
            const status = check
              ? state.validationResults[check.id] ?? check.initialStatus
              : undefined
            const applied = state.appliedFindingIds.includes(finding.id)

            return (
              <tr key={finding.id} className={applied ? 'comparison-row-applied' : undefined}>
                <th scope="row">
                  <span>{finding.id}</span>
                  <strong>{finding.title}</strong>
                </th>
                <td>{remediation?.before ?? finding.evidence}</td>
                <td>{remediation?.after ?? 'No local proposal.'}</td>
                <td>{remediation?.title ?? 'To be qualified'}</td>
                <td>
                  <StatusBadge
                    label={validationLabel(status)}
                    tone={validationTone(status)}
                  />
                </td>
                <td>{limitationLabel(finding.evidenceStatus)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
