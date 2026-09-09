import { FileSearch, Play, RotateCcw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import type { Finding } from '../../domain/models'
import { selectSeverityCounts } from '../../domain/selectors'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AuditProgress } from './AuditProgress'
import {
  FindingFilters,
  initialFindingFilters,
  type FindingFilterState,
} from './FindingFilters'
import { FindingDrawer } from './FindingDrawer'
import { FindingTable } from './FindingTable'

export function AuditPage() {
  const { state, busy, progress, runStaticAudit } = useAssessment()
  const [filters, setFilters] = useState<FindingFilterState>(initialFindingFilters)
  const [selectedFindingId, setSelectedFindingId] = useState<Finding['id'] | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const counts = selectSeverityCounts(telcoScenario)
  const findings = useMemo(() => {
    if (!state.auditCompleted) return []

    return telcoScenario.findings.filter((finding) => {
      const query = filters.query.trim().toLowerCase()
      const matchesQuery =
        query.length === 0 ||
        finding.id.toLowerCase().includes(query) ||
        finding.title.toLowerCase().includes(query)
      const matchesSeverity =
        filters.severity === 'all' || finding.severity === filters.severity
      const matchesEvidence =
        filters.evidence === 'all' || finding.evidenceStatus === filters.evidence
      const isApplied = state.appliedFindingIds.includes(finding.id)
      const matchesRemediation =
        filters.remediation === 'all' ||
        (filters.remediation === 'applied' && isApplied) ||
        (filters.remediation === 'pending' && !isApplied)

      return matchesQuery && matchesSeverity && matchesEvidence && matchesRemediation
    })
  }, [filters, state.appliedFindingIds, state.auditCompleted])

  const selectedFinding = selectedFindingId
    ? telcoScenario.findings.find((finding) => finding.id === selectedFindingId) ?? null
    : null
  const selectedRemediation = selectedFinding
    ? telcoScenario.remediations.find(
        (remediation) => remediation.id === selectedFinding.remediationId,
      )
    : undefined
  const selectedValidationChecks = selectedFinding
    ? telcoScenario.validationChecks.filter((check) =>
        selectedFinding.validationIds.includes(check.id),
      )
    : []

  const canAudit = state.inventoryCompleted

  return (
    <div className="page-stack">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">ÉTAPE 3 · QUALIFICATION</p>
          <h2>Qualifier sans surinterpréter</h2>
          <p>
            Dix constats issus du scénario local, chacun séparant preuve, risque,
            remédiation et validation.
          </p>
        </div>
        <Button
          busy={busy}
          disabled={!canAudit}
          onClick={() => void runStaticAudit()}
          data-guide-id="run-audit"
        >
          {state.auditCompleted ? (
            <RotateCcw aria-hidden="true" size={17} />
          ) : (
            <Play aria-hidden="true" size={17} />
          )}
          {state.auditCompleted
            ? 'Relancer l’audit simulé'
            : 'Lancer l’audit statique simulé'}
        </Button>
      </div>

      {!canAudit ? (
        <div className="prerequisite-banner" role="status">
          <FileSearch aria-hidden="true" size={19} />
          <span>Terminez d’abord l’inventaire simulé</span>
        </div>
      ) : null}

      <Card title="Progression de l’audit" eyebrow="QUALIFICATION LOCALE">
        <AuditProgress
          completed={state.auditCompleted}
          busy={busy}
          progress={progress}
        />
      </Card>

      {state.auditCompleted ? (
        <>
          <div className="finding-count-grid" aria-label="Répartition des sévérités">
            <div><strong>{counts.critical} critiques</strong></div>
            <div><strong>{counts.high} élevés</strong></div>
            <div><strong>{counts.medium} moyens</strong></div>
            <div><strong>{counts.low} faible</strong></div>
            <div><strong>{counts.variable} variable</strong></div>
          </div>

          <Card title="Constats qualifiés" eyebrow="FILTRES CONTRÔLÉS">
            <FindingFilters
              value={filters}
              onChange={setFilters}
              onClear={() => setFilters(initialFindingFilters)}
            />
            <FindingTable
              findings={findings}
              appliedFindingIds={state.appliedFindingIds}
              onSelect={(finding, trigger) => {
                returnFocusRef.current = trigger
                setSelectedFindingId(finding.id)
              }}
            />
            {findings.length === 0 ? (
              <p className="empty-state">Aucun constat ne correspond à ces filtres.</p>
            ) : null}
          </Card>
        </>
      ) : (
        <Card title="Constats en attente" eyebrow="PROCHAINE PREUVE">
          <p className="muted-copy">
            L’audit sera disponible après l’inventaire. Les sévérités et les textes
            ci-dessous proviennent uniquement du scénario local.
          </p>
        </Card>
      )}

      <FindingDrawer
        finding={selectedFinding}
        remediation={selectedRemediation}
        validationChecks={selectedValidationChecks}
        state={state}
        returnFocusRef={returnFocusRef}
        onClose={() => setSelectedFindingId(null)}
      />
    </div>
  )
}
