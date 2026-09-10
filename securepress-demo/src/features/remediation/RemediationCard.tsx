import { Check, Play } from 'lucide-react'
import type { Finding, Remediation } from '../../domain/models'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { ArtifactPreview } from './ArtifactPreview'
import { BeforeAfterDiff } from './BeforeAfterDiff'

interface RemediationCardProps {
  finding: Finding
  remediation: Remediation
  changeSetState: 'staged' | 'applying' | 'applied' | 'failed'
  busy: boolean
  auditCompleted: boolean
  phase?: string
  durationMs?: number
  onApply: () => void
}

function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined) return 'duration unavailable'

  const totalSeconds = Math.max(0, Math.round(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

function changeSetLabel(
  changeSetState: RemediationCardProps['changeSetState'],
  findingId: string,
) {
  if (changeSetState === 'applying') return `Applying change set · ${findingId}`
  if (changeSetState === 'applied') return 'Change set applied'
  if (changeSetState === 'failed') return `Change set failed · ${findingId}`
  return 'Change set staged'
}

export function RemediationCard({
  finding,
  remediation,
  changeSetState,
  busy,
  auditCompleted,
  phase,
  durationMs,
  onApply,
}: RemediationCardProps) {
  const isTargetValidation = finding.id === 'F-005' || finding.id === 'F-007'
  const isMissingArtifact = finding.id === 'F-008'
  const isApplying = changeSetState === 'applying'
  const isApplied = changeSetState === 'applied'

  return (
    <article className="remediation-card" id={`remediation-${finding.id}`}>
      <div className="remediation-card-header">
        <div>
          <p className="remediation-id">{finding.id}</p>
          <h3>{remediation.title}</h3>
        </div>
        <SeverityBadge severity={finding.severity} />
      </div>

      <div className="remediation-status-row">
        <StatusBadge
          label={changeSetLabel(changeSetState, finding.id)}
          tone={isApplied ? 'success' : isApplying ? 'prepared' : changeSetState === 'failed' ? 'critical' : 'neutral'}
        />
        {phase ? <StatusBadge label={`Change set phase · ${phase}`} tone="neutral" /> : null}
        {isTargetValidation ? (
          <StatusBadge label="Target verification required" tone="prepared" />
        ) : null}
        {isMissingArtifact ? (
          <StatusBadge label="Artefact mentionné mais absent" tone="prepared" />
        ) : null}
      </div>

      <BeforeAfterDiff before={remediation.before} after={remediation.after} />

      <div className="remediation-rationale">
        <span>Pourquoi</span>
        <p>{remediation.rationale}</p>
      </div>

      <div className="remediation-artifact-line">
        <span>Artefact associé</span>
        <strong>{remediation.artifact}</strong>
      </div>

      <ArtifactPreview remediationId={remediation.id} />

      <div className="remediation-card-footer">
        {isApplied ? (
          <div className="workspace-update-note">
            <Check aria-hidden="true" size={17} />
            <span>{`Workspace update recorded · ${formatDuration(durationMs)}`}</span>
            <StatusBadge label="Target verification required" tone="prepared" />
          </div>
        ) : null}
        <Button
          variant={isApplied ? 'secondary' : 'primary'}
          disabled={isApplied || busy || !auditCompleted}
          aria-busy={isApplying || undefined}
          onClick={onApply}
          data-guide-id={`apply-${finding.id}`}
        >
          <Play aria-hidden="true" size={15} />
          {isApplied
            ? `Change set applied · ${finding.id}`
            : isApplying
              ? `Applying change set · ${finding.id}`
              : `Apply change set · ${finding.id}`}
        </Button>
      </div>
    </article>
  )
}
