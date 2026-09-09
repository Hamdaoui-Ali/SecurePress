import type { Finding } from '../../domain/models'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface FindingTableProps {
  findings: Finding[]
  appliedFindingIds: Finding['id'][]
  onSelect: (finding: Finding, trigger: HTMLButtonElement) => void
}

function evidenceLabel(status: Finding['evidenceStatus']) {
  switch (status) {
    case 'observed_in_snapshot':
      return 'Constatée dans l’instantané'
    case 'documented_in_audit':
      return 'Mentionnée dans le rapport'
    case 'not_observable_offline':
      return 'Non observable hors ligne'
  }
}

export function FindingTable({
  findings,
  appliedFindingIds,
  onSelect,
}: FindingTableProps) {
  return (
    <div className="table-scroll">
      <table className="finding-table">
        <caption className="sr-only">Constats qualifiés dans l’audit</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Constat</th>
            <th scope="col">Sévérité</th>
            <th scope="col">Preuve</th>
            <th scope="col">Remédiation</th>
            <th scope="col">Détail</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => {
            const applied = appliedFindingIds.includes(finding.id)

            return (
              <tr key={finding.id}>
                <th scope="row">{finding.id}</th>
                <td>
                  <button
                    type="button"
                    className="finding-title-button"
                    data-guide-id={finding.id === 'F-001' ? 'open-f001' : undefined}
                    onClick={(event) => onSelect(finding, event.currentTarget)}
                  >
                    {finding.title}
                    <span>Ouvrir {finding.id}</span>
                  </button>
                </td>
                <td>
                  <SeverityBadge severity={finding.severity} />
                </td>
                <td>
                  <StatusBadge
                    label={evidenceLabel(finding.evidenceStatus)}
                    tone={
                      finding.evidenceStatus === 'observed_in_snapshot'
                        ? 'success'
                        : 'prepared'
                    }
                  />
                </td>
                <td>
                  <StatusBadge
                    label={applied ? 'Appliquée en simulation' : 'À traiter'}
                    tone={applied ? 'success' : 'prepared'}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="table-detail-link"
                    onClick={(event) => onSelect(finding, event.currentTarget)}
                  >
                    Preuve et décision
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
