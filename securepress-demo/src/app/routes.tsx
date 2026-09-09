import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { OverviewPage } from '../features/overview/OverviewPage'
import { InventoryPage } from '../features/inventory/InventoryPage'
import { AuditPage } from '../features/audit/AuditPage'
import { RemediationPage } from '../features/remediation/RemediationPage'
import { ValidationPage } from '../features/validation/ValidationPage'

export const workflowRoutes = [
  '/',
  '/inventaire',
  '/audit',
  '/remediation',
  '/validation',
  '/rapport',
] as const

function StagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">PARCOURS TELCO</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Card title="Étape en préparation" eyebrow="MVP">
        <p className="muted-copy">
          Les données locales et le moteur de simulation sont prêts pour cette
          étape.
        </p>
      </Card>
    </div>
  )
}

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
          element={
            <StagePlaceholder
              title="Comparaison et rapport"
              description="Synthèse avant/après, risque résiduel et chronologie de session."
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
