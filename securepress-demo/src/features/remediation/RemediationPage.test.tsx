import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { telcoScenario } from '../../data/scenario'
import { STORAGE_KEY, saveAssessment } from '../../services/storage'
import { RemediationPage } from './RemediationPage'

beforeEach(() => {
  localStorage.clear()
})

function completedAuditState() {
  return {
    ...createInitialAssessment(),
    stage: 'audit' as const,
    inventoryCompleted: true,
    auditCompleted: true,
    visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
  }
}

function renderRemediation() {
  return render(
    <AssessmentProvider delayMs={0}>
      <RemediationPage />
    </AssessmentProvider>,
  )
}

test('montre le diff F-001 et sa remédiation préparée', () => {
  saveAssessment(completedAuditState())
  renderRemediation()

  expect(screen.getByText(/root/i)).toBeVisible()
  expect(screen.getByText(/telco_app/i)).toBeVisible()
  expect(screen.getAllByText('Remédiation préparée')[0]).toBeVisible()
})

test('records a local workspace update that requires target verification', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderRemediation()

  await user.click(
    screen.getByRole('button', { name: /Appliquer F-001 dans la simulation/i }),
  )

  expect(screen.getByText('Appliqué dans la simulation')).toBeVisible()
  expect(
    screen.getByText('Workspace update recorded · Target verification required'),
  ).toBeVisible()
  expect(
    screen.queryByText('Aucune configuration réelle n’a été modifiée'),
  ).not.toBeInTheDocument()
})

test('conserve les limites particulières et les aperçus non exécutés', () => {
  saveAssessment(completedAuditState())
  renderRemediation()

  expect(screen.getAllByText('Validation cible requise')).toHaveLength(2)
  expect(screen.getByText('Artefact mentionné mais absent')).toBeVisible()
  expect(screen.getAllByText('Mise à jour recommandée')[0]).toBeVisible()
  expect(
    screen.getAllByText('Aperçu uniquement — non exécuté'),
  ).toHaveLength(3)
  expect(screen.getAllByText(/DISALLOW_FILE_EDIT/).at(-1)).toBeVisible()
  expect(screen.getAllByText(/FORCE_SSL_ADMIN/).at(-1)).toBeVisible()
  expect(screen.getAllByText(/wp-cli/i).at(-1)).toBeVisible()
})

test('rend l’application idempotente', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderRemediation()

  const button = screen.getByRole('button', {
    name: /Appliquer F-001 dans la simulation/i,
  })
  await user.click(button)
  await user.click(
    screen.getByRole('button', { name: /Déjà appliqué F-001/i }),
  )

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.appliedFindingIds).toEqual(['F-001'])
  expect(saved.timeline).toHaveLength(2)
})
