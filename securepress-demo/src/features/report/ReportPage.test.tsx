import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { saveAssessment } from '../../services/storage'
import { ReportPage } from './ReportPage'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

function renderReport() {
  return render(
    <AssessmentProvider delayMs={0}>
      <ReportPage />
    </AssessmentProvider>,
  )
}

test('affiche le rapport initial avec posture 42 et risque élevé', () => {
  renderReport()

  expect(screen.getByText('42 / 100')).toBeVisible()
  expect(screen.getByText('10 constats qualifiés')).toBeVisible()
  expect(screen.getByText('Aucun change set appliqué')).toBeVisible()
  expect(screen.getByText('Risque élevé depuis les preuves indexées')).toBeVisible()
  expect(screen.getAllByRole('row')).toHaveLength(11)
})

test('reflète le scénario projeté à 82 et quatre risques restants', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'report',
    auditCompleted: true,
    appliedFindingIds: ['F-001', 'F-002', 'F-003', 'F-004', 'F-007', 'F-009'],
    validationResults: {
      'V-HTTPS-TARGET': 'target_validation_required',
      'external-dynamic-retest': 'dynamic_retest_not_executed',
    },
  })
  renderReport()

  expect(screen.getByText('82 / 100')).toBeVisible()
  expect(screen.getByText('6 change sets appliqués')).toBeVisible()
  expect(screen.getByText('4 risques restent à confirmer')).toBeVisible()
  expect(screen.getByText('18 points de risque résiduel')).toBeVisible()
  expect(screen.getAllByText('Risque résiduel non nul').at(-1)).toBeVisible()
})

test('relie chaque constat à son état renforcé, sa validation et sa limite', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'report',
    auditCompleted: true,
    appliedFindingIds: ['F-001', 'F-002', 'F-003', 'F-004', 'F-007', 'F-009'],
    validationResults: {
      'V-HTTPS-TARGET': 'target_validation_required',
    },
  })
  renderReport()

  const table = screen.getByRole('table', { name: /Comparaison avant/i })
  expect(within(table).getByText(/Compte.*telco_app/i)).toBeVisible()
  expect(within(table).getAllByText('Validation cible requise')).toHaveLength(4)
  expect(
    within(table).getAllByText(/non observable hors ligne|preuve cible/i).at(-1),
  ).toBeVisible()
})

test('shows ordered operation activity without implying target verification', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'report',
    timeline: [
      {
        id: 'second',
        timestamp: '2026-09-09T10:02:00.000Z',
        label: 'Control campaign completed · target verification pending',
      },
      {
        id: 'first',
        timestamp: '2026-09-09T10:01:00.000Z',
        label: 'Première action',
      },
    ],
  })
  renderReport()

  const timeline = screen.getByRole('list', { name: 'Chronologie de session' })
  const entries = within(timeline).getAllByRole('listitem')
  expect(entries[0]).toHaveTextContent('Première action')
  expect(entries[1]).toHaveTextContent(
    'Control campaign completed · target verification pending',
  )
  expect(within(timeline).queryByText(/Aucun événement/i)).not.toBeInTheDocument()
})

test('states indexed evidence, generated change sets, and pending target verification in the printable report', async () => {
  const user = userEvent.setup()
  const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
  renderReport()

  expect(
    screen.getByText('Rapport fondé sur les preuves locales indexées'),
  ).toBeVisible()
  expect(
    screen.getByText(
      'Constats issus du package source TELCO indexé ; change sets générés par le workspace ; vérification cible en attente.',
    ),
  ).toBeVisible()
  expect(
    screen.getByText('Contre-audit dynamique externe — NON EXÉCUTÉ'),
  ).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Imprimer le rapport/i }))
  expect(printSpy).toHaveBeenCalledOnce()
})
