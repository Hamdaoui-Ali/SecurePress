import { useState } from 'react'
import { useLocation } from 'react-router'
import { project } from '../../data/project'
import { ResetDemoDialog } from '../workflow/ResetDemoDialog'

interface TopBarProps {
  busy: boolean
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

export function TopBar({ busy, onReset }: TopBarProps) {
  const { pathname } = useLocation()
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <header className="topbar" aria-labelledby="page-title">
      <div>
        <p className="topbar-kicker">{project.name} · AUDIT STATIQUE</p>
        <h1 id="page-title">
          SecurePress Operations · {titles[pathname] ?? 'Vue d’ensemble'}
        </h1>
      </div>
      <div className="topbar-actions">
        <span className="topbar-status">
          <span className="status-dot" aria-hidden="true" />
          Local workspace
        </span>
        <button
          type="button"
          className="button button-ghost"
          disabled={busy}
          onClick={() => setResetOpen(true)}
        >
          Reset workspace
        </button>
      </div>
      <ResetDemoDialog
        open={resetOpen}
        busy={busy}
        title="Reset workspace?"
        description="All local actions, remediations, validations, and operation history will be cleared."
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          if (busy) return
          setResetOpen(false)
          onReset()
        }}
      />
    </header>
  )
}
