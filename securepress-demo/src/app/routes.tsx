import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'

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
          element={
            <StagePlaceholder
              title="Vue d’ensemble"
              description="Périmètre, posture et limites de l’évaluation hors production."
            />
          }
        />
        <Route
          path="/inventaire"
          element={
            <StagePlaceholder
              title="Inventaire de la copie"
              description="Composants présents dans les fichiers et limites d’activation."
            />
          }
        />
        <Route
          path="/audit"
          element={
            <StagePlaceholder
              title="Audit et qualification"
              description="Constats, preuves, sévérités et confiance de l’observation."
            />
          }
        />
        <Route
          path="/remediation"
          element={
            <StagePlaceholder
              title="Centre de remédiation"
              description="Avant, après, artefacts préparés et application simulée."
            />
          }
        />
        <Route
          path="/validation"
          element={
            <StagePlaceholder
              title="Durcissement et validation"
              description="Contrôles simulés, intégrité, non-régression et limites cible."
            />
          }
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
