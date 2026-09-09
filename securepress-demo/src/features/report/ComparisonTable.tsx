import type { AssessmentState, Scenario, ValidationStatus } from '../../domain/models'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface ComparisonTableProps {
  scenario: Scenario
  state: AssessmentState
}

function validationLabel(status: ValidationStatus | undefined) {
  switch (status) {
    case 'simulated_pass':
      return 'PASS simulé'
    case 'simulated_fail':
      return 'ÉCHEC simulé'
    case 'target_validation_required':
      return 'Validation cible requise'
    case 'dynamic_retest_not_executed':
      return 'Contre-audit non exécuté'
    default:
      return 'Non exécutée'
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
      return 'Preuve cible requise ; non observable hors ligne.'
    case 'documented_in_audit':
      return 'Source documentaire ; artefact à confirmer.'
    default:
      return 'Preuve locale issue de la copie hors production.'
  }
}

export function ComparisonTable({ scenario, state }: ComparisonTableProps) {
  return (
    <div className="table-scroll report-table-scroll">
      <table className="comparison-table" aria-label="Comparaison avant/après">
        <thead>
          <tr>
            <th scope="col">Contrôle</th>
            <th scope="col">État initial</th>
            <th scope="col">État renforcé proposé</th>
            <th scope="col">Remédiation</th>
            <th scope="col">Validation</th>
            <th scope="col">Limite</th>
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
                <td>{remediation?.after ?? 'Aucune proposition locale.'}</td>
                <td>{remediation?.title ?? 'À qualifier'}</td>
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
