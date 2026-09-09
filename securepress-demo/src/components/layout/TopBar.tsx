import { RotateCcw } from 'lucide-react'
import { useLocation } from 'react-router'
import { Button } from '../ui/Button'

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
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw aria-hidden="true" size={16} />
          Réinitialiser la démo
        </Button>
      </div>
    </header>
  )
}
