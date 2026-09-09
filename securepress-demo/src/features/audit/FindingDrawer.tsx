import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type {
  AssessmentState,
  Finding,
  Remediation,
  ValidationCheck,
} from '../../domain/models'
import { SeverityBadge } from '../../components/ui/SeverityBadge'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface FindingDrawerProps {
  finding: Finding | null
  remediation: Remediation | undefined
  validationChecks: ValidationCheck[]
  state: AssessmentState
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
}

function evidenceLabel(status: Finding['evidenceStatus']) {
  switch (status) {
    case 'observed_in_snapshot':
      return 'Constaté dans l’instantané'
    case 'documented_in_audit':
      return 'Mentionné dans le rapport'
    case 'not_observable_offline':
      return 'Non observable hors ligne'
  }
}

function validationLabel(status: string | undefined) {
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

export function FindingDrawer({
  finding,
  remediation,
  validationChecks,
  state,
  returnFocusRef,
  onClose,
}: FindingDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const closeAndReturnFocus = useCallback(() => {
    onClose()
    window.setTimeout(() => returnFocusRef.current?.focus(), 0)
  }, [onClose, returnFocusRef])

  useEffect(() => {
    if (!finding) return

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAndReturnFocus()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      if (focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeAndReturnFocus, finding])

  if (!finding) return null

  const applied = state.appliedFindingIds.includes(finding.id)

  return (
    <div className="drawer-backdrop" onMouseDown={closeAndReturnFocus}>
      <div
        ref={dialogRef}
        className="finding-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="finding-drawer-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{finding.id} · DÉCISION DE RISQUE</p>
            <h2 id="finding-drawer-title">{finding.title}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer"
            ref={closeButtonRef}
            onClick={closeAndReturnFocus}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="drawer-badges">
          <SeverityBadge severity={finding.severity} />
          <StatusBadge label={evidenceLabel(finding.evidenceStatus)} tone="neutral" />
          <StatusBadge
            label={applied ? 'Appliquée en simulation' : 'Remédiation à traiter'}
            tone={applied ? 'success' : 'prepared'}
          />
        </div>

        {finding.severity === 'variable' ? (
          <p className="drawer-warning">Exploitabilité inconnue hors environnement exécuté.</p>
        ) : null}

        <div className="drawer-content">
          <section className="drawer-section">
            <h3>Preuve observée</h3>
            <p>{finding.evidence}</p>
            <p className="drawer-meta">Confiance : {finding.confidence}</p>
          </section>
          <section className="drawer-section">
            <h3>Exposition et impact</h3>
            <dl className="drawer-definitions">
              <div>
                <dt>Exposition</dt>
                <dd>{finding.exposure}</dd>
              </div>
              <div>
                <dt>Impact</dt>
                <dd>{finding.impact}</dd>
              </div>
            </dl>
          </section>
          <section className="drawer-section">
            <h3>Recommandation</h3>
            <p>{finding.recommendation}</p>
            {remediation ? (
              <div className="drawer-remediation-preview">
                <strong>{remediation.title}</strong>
                <span>Artefact : {remediation.artifact}</span>
              </div>
            ) : null}
          </section>
          <section className="drawer-section">
            <h3>Validation associée</h3>
            <div className="drawer-validation-list">
              {validationChecks.map((check) => (
                <div key={check.id}>
                  <span>{check.title}</span>
                  <StatusBadge
                    label={validationLabel(state.validationResults[check.id] ?? check.initialStatus)}
                    tone={
                      state.validationResults[check.id] === 'simulated_pass'
                        ? 'success'
                        : 'prepared'
                    }
                  />
                </div>
              ))}
            </div>
          </section>
          <section className="drawer-section drawer-section-last">
            <h3>Source et limite</h3>
            <p>{finding.sourceNote}</p>
            <p className="drawer-meta">
              Une réussite simulée ne devient jamais une preuve vérifiée sur cible.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
