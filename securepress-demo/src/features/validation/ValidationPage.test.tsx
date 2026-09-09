import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { saveAssessment, STORAGE_KEY } from '../../services/storage'
import { ValidationPage } from './ValidationPage'

beforeEach(() => {
  localStorage.clear()
})

function completedAuditState() {
  return {
    ...createInitialAssessment(),
    stage: 'audit' as const,
    inventoryCompleted: true,
    auditCompleted: true,
  }
}

function renderValidation() {
  return render(
    <AssessmentProvider delayMs={0}>
      <ValidationPage />
    </AssessmentProvider>,
  )
}

test('bloque le lancement global avant la fin de l’audit', () => {
  renderValidation()

  expect(
    screen.getByRole('button', { name: /Lancer la validation simulée/i }),
  ).toBeDisabled()
  expect(
    screen.getByText('Terminez d’abord l’audit statique simulé'),
  ).toBeVisible()
})

test('simule le blocage après cinq échecs de connexion', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderValidation()

  const button = screen.getByRole('button', {
    name: /Simuler un échec de connexion/i,
  })
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await user.click(button)
  }

  expect(screen.getByText('5 / 5 échecs simulés')).toBeVisible()
  expect(
    screen.getByText('Blocage temporaire simulé : 15 minutes'),
  ).toBeVisible()
})

test('présente la politique d’upload et les contrôles de durcissement', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderValidation()

  expect(screen.getByText('shell.php')).toBeVisible()
  expect(screen.getByText('BLOQUÉ')).toBeVisible()
  expect(screen.getAllByText('AUTORISÉ')).toHaveLength(2)

  for (const label of [
    'Énumération par auteur',
    'Routes REST utilisateurs',
    'Divulgation de version',
    'Éditeur de fichiers',
  ]) {
    expect(screen.getByText(label)).toBeVisible()
  }

  const hardeningCard = screen.getByRole('article', {
    name: /Éditeur de fichiers/i,
  })
  await user.click(
    within(hardeningCard).getByRole('button', {
      name: /Exécuter le contrôle/i,
    }),
  )
  expect(within(hardeningCard).getByText('PASS simulé')).toBeVisible()
})

test('lance la campagne et conserve les limites de preuve', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderValidation()

  await user.click(
    screen.getByRole('button', { name: /Lancer la validation simulée/i }),
  )

  expect(screen.getByText('Validation simulée terminée')).toBeVisible()
  expect(screen.getAllByText('PASS simulé')).toHaveLength(6)
  expect(screen.getAllByText('Validation cible requise')).toHaveLength(4)
  expect(
    screen.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
  ).toBeVisible()
  expect(screen.queryByText('Vérifié sur cible')).not.toBeInTheDocument()

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.timeline).toHaveLength(1)
  expect(saved.timeline[0].label).toMatch(/Validation simulée terminée/i)
})

test('affiche les huit groupes de validation', () => {
  saveAssessment(completedAuditState())
  renderValidation()

  for (const label of [
    'Public',
    'Administration',
    'Info Cards',
    'WooCommerce',
    'Durcissement',
    'Intégrité',
    'Non-régression',
    'Contre-vérification',
  ]) {
    expect(screen.getByRole('heading', { name: label })).toBeVisible()
  }
})
