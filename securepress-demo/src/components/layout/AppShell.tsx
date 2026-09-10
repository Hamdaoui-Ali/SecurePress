import type { PropsWithChildren } from 'react'
import { OperationActivity } from '../operations/OperationActivity'
import { OperationProgress } from '../operations/OperationProgress'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { WorkspaceContextBar } from './WorkspaceContextBar'

interface AppShellProps {
  onReset: () => void
  onStartGuidedDemo: () => void
}

export function AppShell({
  onReset,
  onStartGuidedDemo,
  children,
}: PropsWithChildren<AppShellProps>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <div className="app-shell">
        <Sidebar onStartGuidedDemo={onStartGuidedDemo} />
        <div className="app-content">
          <TopBar onReset={onReset} />
          <WorkspaceContextBar />
          <div className="operations-status" aria-label="Operations status">
            <OperationProgress />
            <OperationActivity />
          </div>
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
