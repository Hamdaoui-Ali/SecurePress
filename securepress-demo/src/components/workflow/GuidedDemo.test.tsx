import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider, useAssessment } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { guidedSteps } from '../../data/guided-steps'
import { saveAssessment, STORAGE_KEY } from '../../services/storage'
import { GuidedDemo } from './GuidedDemo'
import { ResetDemoDialog } from './ResetDemoDialog'

beforeEach(() => {
  localStorage.clear()
})

function ProviderProbe() {
  const { state, startGuidedDemo } = useAssessment()

  return (
    <div>
      <output data-testid="guided-step">{state.guidedStep ?? 'none'}</output>
      <output data-testid="inventory">{String(state.inventoryCompleted)}</output>
      <button type="button" onClick={startGuidedDemo}>
        start guide
      </button>
    </div>
  )
}

function renderGuide() {
  return render(
    <AssessmentProvider delayMs={0}>
      <MemoryRouter initialEntries={['/']}>
        <div data-guide-id="overview">Overview cible</div>
        <GuidedDemo />
      </MemoryRouter>
    </AssessmentProvider>,
  )
}

test('définit exactement les huit étapes du parcours', () => {
  expect(guidedSteps).toEqual([
    'overview',
    'run-inventory',
    'run-audit',
    'open-f001',
    'apply-remediation',
    'run-validation',
    'review-comparison',
    'finish-report',
  ])
})

test('démarre le guide en réinitialisant l’assessment', async () => {
  const user = userEvent.setup()
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'validation',
    inventoryCompleted: true,
    auditCompleted: true,
    validationResults: {
      'V-COMMENTS': 'simulated_pass',
      'external-dynamic-retest': 'dynamic_retest_not_executed',
    },
    timeline: [
      {
        id: 'campaign',
        timestamp: '2026-09-10T12:00:00.000Z',
        label: 'Control campaign completed · target verification pending',
      },
    ],
    lastRun: {
      id: 'controls-campaign',
      kind: 'controls',
      status: 'completed',
      startedAt: '2026-09-10T12:00:00.000Z',
      completedAt: '2026-09-10T12:00:01.000Z',
      message: 'Control campaign completed · target verification pending',
    },
    operationHistory: [
      {
        id: 'controls-campaign',
        kind: 'controls',
        status: 'completed',
        startedAt: '2026-09-10T12:00:00.000Z',
        completedAt: '2026-09-10T12:00:01.000Z',
        message: 'Control campaign completed · target verification pending',
      },
    ],
  })

  render(
    <AssessmentProvider delayMs={0}>
      <ProviderProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'start guide' }))

  expect(screen.getByTestId('guided-step')).toHaveTextContent('0')
  expect(screen.getByTestId('inventory')).toHaveTextContent('false')
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    guidedStep: 0,
    validationResults: {},
    timeline: [],
    lastRun: null,
    operationHistory: [],
  })
})

test('affiche un overlay non bloquant et avance d’une étape', async () => {
  const user = userEvent.setup()
  saveAssessment({ ...createInitialAssessment(), guidedStep: 0 })
  renderGuide()

  const overlay = screen.getByRole('region', { name: /guided workspace workflow/i })
  expect(within(overlay).getByText('Étape 1 sur 8')).toBeVisible()
  expect(
    within(overlay).getByText(/Start from the indexed TELCO evidence/i),
  ).toBeVisible()
  expect(within(overlay).getByRole('button', { name: 'Précédent' })).toBeDisabled()

  await user.click(within(overlay).getByRole('button', { name: 'Suivant' }))

  expect(screen.getByText('Étape 2 sur 8')).toBeVisible()
  expect(localStorage.getItem(STORAGE_KEY)).toContain('"guidedStep":1')
})

test('quitte le guide sans effacer l’état du workspace', async () => {
  const user = userEvent.setup()
  saveAssessment({
    ...createInitialAssessment(),
    inventoryCompleted: true,
    guidedStep: 3,
  })
  renderGuide()

  await user.click(screen.getByRole('button', { name: 'Quitter le guide' }))

  expect(screen.queryByRole('region', { name: /guided workspace workflow/i })).not.toBeInTheDocument()
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.guidedStep).toBeNull()
  expect(saved.inventoryCompleted).toBe(true)
})

test('confirme un reset via la boîte de dialogue', async () => {
  const user = userEvent.setup()
  const confirmed: boolean[] = []

  render(
    <ResetDemoDialog
      open
      title="Reset workspace?"
      description="Le parcours local sera remis à zéro."
      onCancel={() => undefined}
      onConfirm={() => confirmed.push(true)}
    />,
  )

  const dialog = screen.getByRole('dialog', { name: 'Reset workspace?' })
  expect(within(dialog).getByRole('button', { name: 'Annuler' })).toBeVisible()
  await user.click(
    within(dialog).getByRole('button', { name: 'Confirmer la réinitialisation' }),
  )
  expect(confirmed).toEqual([true])
})

test('uses workspace update and target-verification language in guided steps', () => {
  saveAssessment({ ...createInitialAssessment(), guidedStep: 4 })
  const changeSetGuide = renderGuide()

  expect(screen.getByText('Prepare the priority change set')).toBeVisible()
  expect(
    screen.getByText(/Apply the F-001 change set as a workspace operation/i),
  ).toBeVisible()
  expect(screen.getByText(/Target verification remains pending/i)).toBeVisible()
  expect(screen.getByRole('region')).not.toHaveTextContent(/simulation|configuration r.elle/i)

  changeSetGuide.unmount()
  saveAssessment({ ...createInitialAssessment(), guidedStep: 7 })
  renderGuide()

  expect(screen.getByText('Print provenance report')).toBeVisible()
  expect(screen.getByText(/source-package provenance/i)).toBeVisible()
  expect(screen.getByText(/target verification pending/i)).toBeVisible()
})

test('uses operational control-campaign language in the validation guided step', () => {
  saveAssessment({ ...createInitialAssessment(), guidedStep: 5 })
  renderGuide()

  expect(screen.getByText('Run control campaign')).toBeVisible()
  expect(
    screen.getByText(/Run the provider-backed multi-phase control campaign/i),
  ).toBeVisible()
})

test('runs the provider-backed control campaign before advancing from the controls step', async () => {
  const user = userEvent.setup()
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'audit',
    inventoryCompleted: true,
    auditCompleted: true,
    guidedStep: 5,
  })
  renderGuide()

  await user.click(screen.getByRole('button', { name: 'Suivant' }))

  expect(await screen.findByText('Étape 7 sur 8')).toBeVisible()
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    guidedStep: 6,
    validationResults: {
      'V-COMMENTS': 'simulated_pass',
      'external-dynamic-retest': 'dynamic_retest_not_executed',
    },
    lastRun: {
      kind: 'controls',
      status: 'completed',
      message: 'Control campaign completed · target verification pending',
    },
  })
})
