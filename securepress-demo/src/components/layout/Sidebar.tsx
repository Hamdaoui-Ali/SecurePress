import {
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  ListChecks,
  Shield,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { Button } from '../ui/Button'
import { project } from '../../data/project'

interface SidebarProps {
  busy: boolean
  onStartGuidedDemo: () => void
}

const navigation = [
  { to: '/', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { to: '/inventaire', label: 'Inventaire', icon: ListChecks },
  { to: '/audit', label: 'Audit & qualification', icon: FileSearch },
  { to: '/remediation', label: 'Remédiation', icon: Shield },
  {
    to: '/validation',
    label: 'Durcissement & validation',
    icon: ClipboardCheck,
  },
  { to: '/rapport', label: 'Comparaison & rapport', icon: Sparkles },
] as const

export function Sidebar({ busy, onStartGuidedDemo }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          <Shield size={22} />
        </div>
        <div>
          <p className="brand-name">SecurePress</p>
          <p className="brand-subtitle">Operations</p>
        </div>
      </div>

      <div className="project-block">
        <p className="sidebar-label">Projet</p>
        <p className="project-name">{project.name}</p>
      </div>

      <nav className="sidebar-nav" aria-labelledby="sidebar-nav-title">
        <h2 id="sidebar-nav-title" className="sr-only">
          Étapes de l’espace de travail
        </h2>
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link-active' : ''}`
            }
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footnote">Copie hors production</p>
        <Button
          className="guided-button"
          disabled={busy}
          variant="secondary"
          onClick={onStartGuidedDemo}
        >
          <Sparkles aria-hidden="true" size={16} />
          Démarrer le parcours guidé
        </Button>
      </div>
    </aside>
  )
}
