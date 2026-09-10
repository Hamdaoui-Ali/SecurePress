import { render, screen, waitFor, within } from '@testing-library/react'
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

function renderValidation(delayMs = 0) {
  return render(
    <AssessmentProvider delayMs={delayMs}>
      <ValidationPage />
    </AssessmentProvider>,
  )
}

test('blocks the control campaign until finding analysis is complete', () => {
  renderValidation()

  expect(
    screen.getByRole('button', { name: 'Run control campaign' }),
  ).toBeDisabled()
  expect(
    screen.getByText('Complete finding analysis before running controls'),
  ).toBeVisible()
})

test('records the browser-only login control after five failed attempts', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderValidation()

  const button = screen.getByRole('button', {
    name: /Record a failed login attempt/i,
  })
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await user.click(button)
  }

  expect(screen.getByText('5 / 5 failed attempts recorded locally')).toBeVisible()
  expect(
    screen.getByText('Temporary block expected: 15 minutes'),
  ).toBeVisible()
})

test('présente la politique d’upload et les contrôles de durcissement', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderValidation()

  expect(screen.getByText('shell.php')).toBeVisible()
  expect(screen.getByText('BLOQUÉ')).toBeVisible()
  expect(screen.getAllByText('AUTORISÉ')).toHaveLength(2)

  for (const controlId of ['V-FILE-EDITOR', 'V-XMLRPC-TARGET']) {
    expect(screen.getByText(controlId)).toBeVisible()
  }
  expect(screen.queryByText('Énumération par auteur')).not.toBeInTheDocument()

  const hardeningCard = screen.getByRole('article', {
    name: /Éditeur de fichiers désactivé/i,
  })
  await user.click(
    within(hardeningCard).getByRole('button', {
      name: /Run control/i,
    }),
  )
  expect(await within(hardeningCard).findByText('PASS')).toBeVisible()

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.completedHardeningCheckIds).toEqual(['V-FILE-EDITOR'])
})

test('runs the multi-phase control campaign with PASS results and target verification pending', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderValidation(250)

  await user.click(
    screen.getByRole('button', { name: 'Run control campaign' }),
  )

  await waitFor(() => {
    expect(screen.getByText('Initialisation de la campagne de contrôles')).toBeVisible()
  })

  expect(
    await screen.findByText(
      'Control campaign completed · target verification pending',
      {},
      { timeout: 3_000 },
    ),
  ).toBeVisible()
  expect(screen.getAllByText('PASS')).toHaveLength(6)
  expect(screen.getAllByText('Validation cible requise')).toHaveLength(4)
  expect(
    screen.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
  ).toBeVisible()
  expect(screen.queryByText('Vérifié sur cible')).not.toBeInTheDocument()

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.lastRun).toMatchObject({
    kind: 'controls',
    status: 'completed',
    message: 'Control campaign completed · target verification pending',
    currentStep: 'Clôture de la campagne',
    processed: 10,
    total: 10,
  })
  expect(saved.operationHistory).toEqual([
    expect.objectContaining({
      kind: 'controls',
      message: 'Control campaign completed · target verification pending',
    }),
  ])
  expect(saved.timeline.map((event: { label: string }) => event.label)).toEqual(
    expect.arrayContaining([
      'Control campaign completed · target verification pending',
    ]),
  )
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
