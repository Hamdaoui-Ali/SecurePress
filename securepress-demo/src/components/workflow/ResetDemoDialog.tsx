import { AlertTriangle, X } from 'lucide-react'
import { useId } from 'react'
import { Button } from '../../components/ui/Button'

interface ResetDemoDialogProps {
  open: boolean
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => void
}

export function ResetDemoDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: ResetDemoDialogProps) {
  const titleId = useId()

  if (!open) return null

  return (
    <div className="reset-dialog-backdrop">
      <section
        className="reset-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="reset-dialog-header">
          <div className="reset-dialog-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer"
            onClick={onCancel}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        <div className="reset-dialog-actions">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirmer la réinitialisation
          </Button>
        </div>
      </section>
    </div>
  )
}
