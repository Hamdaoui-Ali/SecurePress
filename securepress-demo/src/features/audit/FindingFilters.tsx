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
        <span>Rechercher</span>
        <input
          type="search"
          value={value.query}
          placeholder="ID ou titre"
          onChange={(event) =>
            onChange({ ...value, query: event.currentTarget.value })
          }
        />
      </label>
      <label className="filter-field">
        <span>Sévérité</span>
        <select
          value={value.severity}
          onChange={(event) =>
            onChange({
              ...value,
              severity: event.currentTarget.value as FindingFilterState['severity'],
            })
          }
        >
          <option value="all">Toutes</option>
          <option value="critical">Critique</option>
          <option value="high">Élevée</option>
          <option value="medium">Moyenne</option>
          <option value="low">Faible</option>
          <option value="variable">Variable</option>
        </select>
      </label>
      <label className="filter-field">
        <span>État de preuve</span>
        <select
          value={value.evidence}
          onChange={(event) =>
            onChange({
              ...value,
              evidence: event.currentTarget.value as FindingFilterState['evidence'],
            })
          }
        >
          <option value="all">Tous</option>
          <option value="observed_in_snapshot">Instantané</option>
          <option value="documented_in_audit">Rapport</option>
          <option value="not_observable_offline">Non observable hors ligne</option>
        </select>
      </label>
      <label className="filter-field">
        <span>État de remédiation</span>
        <select
          value={value.remediation}
          onChange={(event) =>
            onChange({
              ...value,
              remediation: event.currentTarget.value as FindingFilterState['remediation'],
            })
          }
        >
          <option value="all">Tous</option>
          <option value="applied">Change set applied</option>
          <option value="pending">Change set pending</option>
        </select>
      </label>
      <button type="button" className="filter-clear" onClick={onClear}>
        Effacer les filtres
      </button>
    </div>
  )
}
