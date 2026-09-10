import { RotateCcw, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'

const MAX_ATTEMPTS = 5

export function LoginAttemptsDemo() {
  const [attempts, setAttempts] = useState(0)
  const blocked = attempts >= MAX_ATTEMPTS

  return (
    <section className="validation-demo-card" aria-labelledby="login-demo-title">
      <div className="validation-demo-header">
        <div>
          <p className="card-eyebrow">LOCAL BROWSER CONTROL</p>
          <h3 id="login-demo-title">Limitation des tentatives de connexion</h3>
        </div>
        <ShieldAlert aria-hidden="true" size={20} />
      </div>
      <p>
        Le compteur reste dans le navigateur et ne tente aucune authentification
        réelle.
      </p>
      <div className="login-attempt-meter" aria-live="polite">
        <strong>
          {attempts} / {MAX_ATTEMPTS} failed attempts recorded locally
        </strong>
        <div className="login-attempt-track" aria-hidden="true">
          <span style={{ width: `${(attempts / MAX_ATTEMPTS) * 100}%` }} />
        </div>
      </div>
      {blocked ? (
        <StatusBadge
          label="Temporary block expected: 15 minutes"
          tone="success"
        />
      ) : (
        <StatusBadge label="No block reached" tone="prepared" />
      )}
      <div className="validation-demo-actions">
        <Button
          disabled={blocked}
          onClick={() => setAttempts((current) => Math.min(MAX_ATTEMPTS, current + 1))}
        >
          Record a failed login attempt
        </Button>
        <Button
          variant="ghost"
          disabled={attempts === 0}
          onClick={() => setAttempts(0)}
        >
          <RotateCcw aria-hidden="true" size={15} />
          Réinitialiser
        </Button>
      </div>
    </section>
  )
}
