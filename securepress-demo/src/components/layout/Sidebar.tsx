import {
  ClipboardCheck,
  FileSearch,
  LockKeyhole,
  LayoutDashboard,
  ListChecks,
  Shield,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { Button } from '../ui/Button'
import { project } from '../../data/project'
import type { AssessmentState, WorkflowStage } from '../../domain/models'
import { selectWorkflowStep } from '../../domain/selectors'

interface SidebarProps {
  busy: boolean
  state: AssessmentState
  onStartGuidedDemo: () => void
}

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, stage: 'overview' },
  { to: '/inventaire', label: 'Discovery', icon: ListChecks, stage: 'inventory' },
  { to: '/audit', label: 'Finding analysis', icon: FileSearch, stage: 'audit' },
  { to: '/remediation', label: 'Change sets', icon: Shield, stage: 'remediation' },
  {
    to: '/validation',
    label: 'Controls & validation',
    icon: ClipboardCheck,
    stage: 'validation',
  },
  { to: '/rapport', label: 'Comparison & report', icon: Sparkles, stage: 'report' },
] as const

export function Sidebar({ busy, state, onStartGuidedDemo }: SidebarProps) {
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
        <p className="sidebar-label">Project</p>
        <p className="project-name">{project.name}</p>
      </div>

      <nav className="sidebar-nav" aria-labelledby="sidebar-nav-title">
        <h2 id="sidebar-nav-title" className="sr-only">
          Workspace workflow
        </h2>
        {navigation.map(({ to, label, icon: Icon, stage }) => {
          const step = selectWorkflowStep(state, stage as WorkflowStage)

          if (step.status === 'locked') {
            return (
              <div
                key={to}
                className="nav-link nav-link-locked"
                aria-disabled="true"
                aria-label={`${label} — ${step.reason}`}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                <span>{label}</span>
                <LockKeyhole aria-hidden="true" size={14} />
              </div>
            )
          }

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link-active' : ''}${step.status === 'completed' ? ' nav-link-completed' : ''}`
              }
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footnote">Offline demonstration copy</p>
        <Button
          className="guided-button"
          disabled={busy}
          variant="secondary"
          onClick={onStartGuidedDemo}
        >
          <Sparkles aria-hidden="true" size={16} />
          Start guided walkthrough
        </Button>
      </div>
    </aside>
  )
}
