import { render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { createInitialAssessment } from '../../domain/models'
import { saveAssessment } from '../../services/storage'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { OverviewPage } from './OverviewPage'

beforeEach(() => {
  localStorage.clear()
})

function renderOverview() {
  return render(
    <AssessmentProvider delayMs={0}>
      <OverviewPage />
    </AssessmentProvider>,
  )
}

test('affiche les métriques initiales et les limites de preuve', () => {
  renderOverview()

  const metricValue = (label: string) => {
    const card = screen.getByText(label).closest('article')
    if (!card) throw new Error(`Metric card not found: ${label}`)
    const value = card.querySelector('.metric-value')
    if (!value) throw new Error(`Metric value not found: ${label}`)
    return value
  }

  expect(metricValue('Extensions identifiées')).toHaveTextContent('17')
  expect(metricValue('Thèmes inventoriés')).toHaveTextContent('4')
  expect(metricValue('Constats qualifiés')).toHaveTextContent('10')
  expect(metricValue('Constats critiques')).toHaveTextContent('2')
  expect(
    screen.getByRole('img', { name: /Indice pédagogique simulé : 42 sur 100/i }),
  ).toBeVisible()
  expect(screen.getByText('Indice pédagogique simulé')).toBeVisible()
  expect(screen.getByText('Audit statique')).toBeVisible()
  expect(screen.getByText('Copie hors production')).toBeVisible()
  expect(screen.getByText('Activation des extensions inconnue')).toBeVisible()
  expect(
    screen.getByText('Contre-audit dynamique non exécuté'),
  ).toBeVisible()
})

test('affiche la posture projetée sans la transformer en preuve cible', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'remediation',
    appliedFindingIds: [
      'F-001',
      'F-002',
      'F-003',
      'F-004',
      'F-007',
      'F-009',
    ],
  })

  renderOverview()

  expect(
    screen.getByRole('img', { name: /Indice pédagogique simulé : 82 sur 100/i }),
  ).toBeVisible()
  expect(screen.getByText('Projeté, non vérifié sur cible')).toBeVisible()
})
