import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { OverviewPage } from '../features/overview/OverviewPage'
import { InventoryPage } from '../features/inventory/InventoryPage'
import { AuditPage } from '../features/audit/AuditPage'
import { RemediationPage } from '../features/remediation/RemediationPage'
import { ValidationPage } from '../features/validation/ValidationPage'
import { ReportPage } from '../features/report/ReportPage'

export const workflowRoutes = [
  '/',
  '/inventaire',
  '/audit',
  '/remediation',
  '/validation',
  '/rapport',
] as const

interface AppRoutesProps {
  onReset: () => void
  onStartGuidedDemo: () => void
}

export function AppRoutes({ onReset, onStartGuidedDemo }: AppRoutesProps) {
  return (
    <AppShell onReset={onReset} onStartGuidedDemo={onStartGuidedDemo}>
      <Routes>
        <Route
          path="/"
          element={<OverviewPage />}
        />
        <Route
          path="/inventaire"
          element={<InventoryPage />}
        />
        <Route
          path="/audit"
          element={<AuditPage />}
        />
        <Route
          path="/remediation"
          element={<RemediationPage />}
        />
        <Route
          path="/validation"
          element={<ValidationPage />}
        />
        <Route
          path="/rapport"
          element={<ReportPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
