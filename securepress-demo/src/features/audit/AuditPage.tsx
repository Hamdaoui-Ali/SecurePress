import { FileSearch, LoaderCircle, Play, RotateCcw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useAssessment } from '../../app/AssessmentProvider'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { telcoScenario } from '../../data/scenario'
import type { Finding } from '../../domain/models'
import { selectSeverityCounts } from '../../domain/selectors'
import { AuditProgress } from './AuditProgress'
import {
  FindingFilters,
  initialFindingFilters,
  type FindingFilterState,
} from './FindingFilters'
import { FindingDrawer } from './FindingDrawer'
import { FindingTable } from './FindingTable'

export function AuditPage() {
  const { state, busy, progress, activeOperation, runStaticAudit } = useAssessment()
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
  const isAnalyzing = busy && activeOperation?.kind === 'analysis'

  return (
    <div className="page-stack">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">FINDING ANALYSIS</p>
          <h2>Analyze findings without overclaiming</h2>
          <p>
            Findings retain their evidence, risk, recommended change set, and
            required target verification.
          </p>
        </div>
        <Button
          busy={false}
          disabled={busy || !canAudit}
          aria-busy={isAnalyzing || undefined}
          onClick={() => void runStaticAudit()}
          data-guide-id="run-audit"
        >
          {isAnalyzing ? (
            <LoaderCircle aria-hidden="true" size={17} />
          ) : state.auditCompleted ? (
            <RotateCcw aria-hidden="true" size={17} />
          ) : (
            <Play aria-hidden="true" size={17} />
          )}
          {isAnalyzing
            ? 'Finding analysis in progress'
            : state.auditCompleted
              ? 'Analyze findings again'
              : 'Analyze findings'}
        </Button>
      </div>

      {!canAudit ? (
        <div className="prerequisite-banner" role="status">
          <FileSearch aria-hidden="true" size={19} />
          <span>Run discovery before analyzing findings</span>
        </div>
      ) : null}

      <Card title="Finding analysis progress" eyebrow="EVIDENCE CORRELATION">
        <AuditProgress
          completed={state.auditCompleted}
          running={isAnalyzing}
          progress={progress}
        />
      </Card>

      {state.auditCompleted ? (
        <>
          <div className="finding-count-grid" aria-label="Finding severity distribution">
            <div><strong>{counts.critical} critical</strong></div>
            <div><strong>{counts.high} high</strong></div>
            <div><strong>{counts.medium} medium</strong></div>
            <div><strong>{counts.low} low</strong></div>
            <div><strong>{counts.variable} variable</strong></div>
          </div>

          <Card title="Qualified findings" eyebrow="FILTERS">
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
              <p className="empty-state">No findings match these filters.</p>
            ) : null}
          </Card>
        </>
      ) : (
        <Card title="Findings pending" eyebrow="NEXT ACTION">
          <p className="muted-copy">
            Finding analysis is available after discovery. Findings are exposed
            only after the analysis operation completes.
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
