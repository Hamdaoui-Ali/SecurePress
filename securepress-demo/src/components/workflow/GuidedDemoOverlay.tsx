import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react'
import { useId } from 'react'
import { Button } from '../../components/ui/Button'

interface GuidedDemoOverlayProps {
  stepNumber: number
  totalSteps: number
  title: string
  description: string
  isFirst: boolean
  isLast: boolean
  busy?: boolean
  onPrevious: () => void
  onNext: () => void
  onExit: () => void
}

export function GuidedDemoOverlay({
  stepNumber,
  totalSteps,
  title,
  description,
  isFirst,
  isLast,
  busy = false,
  onPrevious,
  onNext,
  onExit,
}: GuidedDemoOverlayProps) {
  const guideLabelId = useId()
  const titleId = useId()
  const descriptionId = useId()

  return (
    <aside
      className="guided-demo-overlay"
      role="region"
      aria-live="polite"
      aria-labelledby={`${guideLabelId} ${titleId}`}
      aria-describedby={descriptionId}
    >
      <span id={guideLabelId} className="sr-only">
        Guided workspace workflow
      </span>
      <div className="guided-demo-overlay-header">
        <div className="guided-demo-icon" aria-hidden="true">
          <Sparkles size={17} />
        </div>
        <div>
          <p className="guided-demo-step">Étape {stepNumber} sur {totalSteps}</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Quitter le guide"
          onClick={onExit}
        >
          <X aria-hidden="true" size={17} />
        </button>
      </div>
      <p id={descriptionId}>{description}</p>
      <div className="guided-demo-actions">
        <Button variant="ghost" disabled={isFirst} onClick={onPrevious}>
          <ArrowLeft aria-hidden="true" size={15} />
          Précédent
        </Button>
        <Button busy={busy} onClick={onNext} data-guide-id="guided-next">
          {isLast ? 'Terminer le guide' : 'Suivant'}
          {!isLast ? <ArrowRight aria-hidden="true" size={15} /> : null}
        </Button>
      </div>
    </aside>
  )
}
