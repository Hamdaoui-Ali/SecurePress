import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { telcoScenario } from '../../data/scenario'
import { saveAssessment } from '../../services/storage'
import { AuditPage } from './AuditPage'

beforeEach(() => {
  localStorage.clear()
})

function renderAudit() {
  return render(
    <AssessmentProvider delayMs={0}>
      <AuditPage />
    </AssessmentProvider>,
  )
}

function completedInventoryState() {
  return {
    ...createInitialAssessment(),
    stage: 'inventory' as const,
    inventoryCompleted: true,
  }
}

function completedAuditState() {
  return {
    ...completedInventoryState(),
    stage: 'audit' as const,
    auditCompleted: true,
    visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
  }
}

test('bloque l’audit tant que l’inventaire n’est pas terminé', () => {
  renderAudit()

  expect(
    screen.getByRole('button', { name: /Lancer l’audit statique simulé/i }),
  ).toBeDisabled()
  expect(
    screen.getByText('Terminez d’abord l’inventaire simulé'),
  ).toBeVisible()
})

test('génère les dix constats après inventaire', async () => {
  const user = userEvent.setup()
  saveAssessment(completedInventoryState())
  renderAudit()

  await user.click(
    screen.getByRole('button', { name: /Lancer l’audit statique simulé/i }),
  )

  expect(screen.getByText('Audit simulé terminé')).toBeVisible()
  expect(screen.getByText('2 critiques')).toBeVisible()
  expect(screen.getByText('3 élevés')).toBeVisible()
  expect(screen.getByText('3 moyens')).toBeVisible()
  expect(screen.getByText('1 faible')).toBeVisible()
  expect(screen.getByText('1 variable')).toBeVisible()
  expect(screen.getAllByRole('row')).toHaveLength(11)
})

test('explique F-001 et F-006 dans le panneau de preuve', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderAudit()

  await user.click(screen.getByRole('button', { name: /Ouvrir F-001/i }))
  const firstDialog = screen.getByRole('dialog')
  expect(firstDialog).toBeVisible()
  expect(within(firstDialog).getByText('Critique')).toBeVisible()
  expect(
    within(firstDialog).getByText('Constaté dans l’instantané'),
  ).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Fermer/i }))
  await user.click(screen.getByRole('button', { name: /Ouvrir F-006/i }))
  const secondDialog = screen.getByRole('dialog')
  expect(within(secondDialog).getByText('Sévérité variable')).toBeVisible()
  expect(
    within(secondDialog).getAllByText(/Exploitabilité inconnue/i)[0],
  ).toBeVisible()
})

test('filtre les constats critiques puis restaure toutes les lignes', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderAudit()

  await user.selectOptions(screen.getByLabelText('Sévérité'), 'critical')

  expect(screen.getAllByRole('row')).toHaveLength(3)
  expect(screen.getByText('F-001')).toBeVisible()
  expect(screen.getByText('F-002')).toBeVisible()
  expect(screen.queryByText('F-003')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Effacer les filtres/i }))
  expect(screen.getAllByRole('row')).toHaveLength(11)
})
