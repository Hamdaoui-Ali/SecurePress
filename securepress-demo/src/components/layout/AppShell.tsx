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
    <div className="app-shell">
      <Sidebar onStartGuidedDemo={onStartGuidedDemo} />
      <div className="app-content">
        <TopBar onReset={onReset} />
        <DemoBanner />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
