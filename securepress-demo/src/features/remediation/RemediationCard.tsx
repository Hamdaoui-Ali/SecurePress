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
  applied: boolean
  busy: boolean
  auditCompleted: boolean
  onApply: () => void
}

function remediationStatus(remediation: Remediation, applied: boolean) {
  if (applied) return 'Appliqué dans la simulation'
  if (remediation.initialStatus === 'recommended') return 'Mise à jour recommandée'
  if (remediation.initialStatus === 'developed') return 'Remédiation développée'
  return 'Remédiation préparée'
}

export function RemediationCard({
  finding,
  remediation,
  applied,
  busy,
  auditCompleted,
  onApply,
}: RemediationCardProps) {
  const isTargetValidation = finding.id === 'F-005' || finding.id === 'F-007'
  const isMissingArtifact = finding.id === 'F-008'

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
          label={remediationStatus(remediation, applied)}
          tone={applied ? 'success' : remediation.initialStatus === 'recommended' ? 'prepared' : 'neutral'}
        />
        {isTargetValidation ? (
          <StatusBadge label="Validation cible requise" tone="prepared" />
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
        {applied ? (
          <div className="simulation-applied-note">
            <Check aria-hidden="true" size={17} />
            <span>Aucune configuration réelle n’a été modifiée</span>
          </div>
        ) : null}
        <Button
          variant={applied ? 'secondary' : 'primary'}
          disabled={applied || !auditCompleted}
          busy={busy && !applied}
          onClick={onApply}
          data-guide-id={`apply-${finding.id}`}
        >
          <Play aria-hidden="true" size={15} />
          {applied
            ? `Déjà appliqué ${finding.id}`
            : `Appliquer ${finding.id} dans la simulation`}
        </Button>
      </div>
    </article>
  )
}
