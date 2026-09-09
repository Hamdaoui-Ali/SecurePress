import type { PropsWithChildren } from 'react'
import { DemoBanner } from './DemoBanner'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

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
          <DemoBanner />
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
