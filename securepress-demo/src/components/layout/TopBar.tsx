import { useLocation } from 'react-router'
import { useState } from 'react'
import { ResetDemoDialog } from '../workflow/ResetDemoDialog'

interface TopBarProps {
  onReset: () => void
}

const titles: Record<string, string> = {
  '/': 'Vue d’ensemble',
  '/inventaire': 'Inventaire de la copie',
  '/audit': 'Audit et qualification',
  '/remediation': 'Centre de remédiation',
  '/validation': 'Durcissement et validation',
  '/rapport': 'Comparaison et rapport',
}

export function TopBar({ onReset }: TopBarProps) {
  const { pathname } = useLocation()
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <header className="topbar">
      <div>
        <p className="topbar-kicker">TELCO · AUDIT STATIQUE</p>
        <h1>
          SecurePress Audit Lab · {titles[pathname] ?? 'Vue d’ensemble'}
        </h1>
      </div>
      <div className="topbar-actions">
        <span className="topbar-status">
          <span className="status-dot" aria-hidden="true" />
          Session locale
        </span>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => setResetOpen(true)}
        >
          Réinitialiser la démo
        </button>
      </div>
      <ResetDemoDialog
        open={resetOpen}
        title="Réinitialiser la démo ?"
        description="Toutes les actions locales, remédiations et validations seront effacées."
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          setResetOpen(false)
          onReset()
        }}
      />
    </header>
  )
}
