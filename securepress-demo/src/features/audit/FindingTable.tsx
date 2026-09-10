import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Finding } from '../../domain/models'

interface FindingTableProps {
  findings: Finding[]
  appliedFindingIds: Finding['id'][]
  onSelect: (finding: Finding, trigger: HTMLButtonElement) => void
}

function evidenceLabel(status: Finding['evidenceStatus']) {
  switch (status) {
    case 'observed_in_snapshot':
      return 'Observed in package'
    case 'documented_in_audit':
      return 'Documented finding'
    case 'not_observable_offline':
      return 'Not observable locally'
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
        <caption className="sr-only">Qualified workspace findings</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Finding</th>
            <th scope="col">Severity</th>
            <th scope="col">Evidence</th>
            <th scope="col">Change set</th>
            <th scope="col">Details</th>
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
                    <span>Open {finding.id}</span>
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
                    label={applied ? 'Change set applied' : 'Change set pending'}
                    tone={applied ? 'success' : 'prepared'}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="table-detail-link"
                    onClick={(event) => onSelect(finding, event.currentTarget)}
                  >
                    Evidence and decision
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
