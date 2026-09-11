import type { EvidenceStatus, Severity } from '../../domain/models'

export interface FindingFilterState {
  query: string
  severity: Severity | 'all'
  evidence: EvidenceStatus | 'all'
  remediation: 'all' | 'applied' | 'pending'
}

interface FindingFiltersProps {
  value: FindingFilterState
  onChange: (next: FindingFilterState) => void
  onClear: () => void
}

export const initialFindingFilters: FindingFilterState = {
  query: '',
  severity: 'all',
  evidence: 'all',
  remediation: 'all',
}

export function FindingFilters({
  value,
  onChange,
  onClear,
}: FindingFiltersProps) {
  return (
    <div className="finding-filters">
      <label className="filter-field filter-search">
        <span>Search</span>
        <input
          type="search"
          value={value.query}
          placeholder="ID or title"
          onChange={(event) =>
            onChange({ ...value, query: event.currentTarget.value })
          }
        />
      </label>
      <label className="filter-field">
        <span>Severity</span>
        <select
          value={value.severity}
          onChange={(event) =>
            onChange({
              ...value,
              severity: event.currentTarget.value as FindingFilterState['severity'],
            })
          }
        >
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="variable">Variable</option>
        </select>
      </label>
      <label className="filter-field">
        <span>Evidence status</span>
        <select
          value={value.evidence}
          onChange={(event) =>
            onChange({
              ...value,
              evidence: event.currentTarget.value as FindingFilterState['evidence'],
            })
          }
        >
          <option value="all">All</option>
          <option value="observed_in_snapshot">Observed in package</option>
          <option value="documented_in_audit">Documented finding</option>
          <option value="not_observable_offline">Not observable locally</option>
        </select>
      </label>
      <label className="filter-field">
        <span>Change-set status</span>
        <select
          value={value.remediation}
          onChange={(event) =>
            onChange({
              ...value,
              remediation: event.currentTarget.value as FindingFilterState['remediation'],
            })
          }
        >
          <option value="all">All</option>
          <option value="applied">Change set applied</option>
          <option value="pending">Change set pending</option>
        </select>
      </label>
      <button type="button" className="filter-clear" onClick={onClear}>
        Clear filters
      </button>
    </div>
  )
}
