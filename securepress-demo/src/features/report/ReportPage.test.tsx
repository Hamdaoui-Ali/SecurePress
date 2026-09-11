import { render, screen, waitFor, within } from '@testing-library/react'
import { HashRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { AssessmentProvider, useAssessment } from '../../app/AssessmentProvider'
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
      <HashRouter>
        <ReportPage />
      </HashRouter>
    </AssessmentProvider>,
  )
}

function ReportOperationControls() {
  const { runInventory, runStaticAudit, runValidation } = useAssessment()

  return (
    <div>
      <button type="button" onClick={() => void runInventory()}>
        run discovery
      </button>
      <button type="button" onClick={() => void runStaticAudit()}>
        run analysis
      </button>
      <button type="button" onClick={() => void runValidation()}>
        run controls
      </button>
    </div>
  )
}

function renderReportWithOperations() {
  return render(
    <AssessmentProvider delayMs={0}>
      <ReportOperationControls />
      <HashRouter>
        <ReportPage />
      </HashRouter>
    </AssessmentProvider>,
  )
}

test('shows a pending report before discovery and hides report evidence', () => {
  renderReport()

  expect(screen.getByText('Report pending')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Continue to discovery' })).toBeVisible()
  expect(screen.queryByText('42 / 100')).not.toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Download report/i })).not.toBeInTheDocument()
})

test('points an analyzed workspace to controls before exposing the final report', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'audit',
    inventoryCompleted: true,
    auditCompleted: true,
  })
  renderReport()

  expect(screen.getByText('Controls required before final report')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Run control campaign' })).toBeVisible()
  expect(screen.queryByText('42 / 100')).not.toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})

test('shows the projected 82 posture and four residual findings', () => {
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
  expect(screen.getByText('6 change sets applied')).toBeVisible()
  expect(screen.getByText('4 findings remain to be confirmed')).toBeVisible()
  expect(screen.getByText('18 residual-risk points')).toBeVisible()
  expect(screen.getAllByText('Residual risk remains').at(-1)).toBeVisible()
})

test('links each finding to its hardened state, validation, and limit', () => {
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

  const table = screen.getByRole('table', { name: /Before and after comparison/i })
  expect(within(table).getByText(/account.*telco_app/i)).toBeVisible()
  expect(within(table).getAllByText('Target verification required')).toHaveLength(4)
  expect(
    within(table).getAllByText(/not observable locally|target evidence/i).at(-1),
  ).toBeVisible()
})

test('shows ordered operation activity without implying target verification', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'report',
    validationResults: {
      'external-dynamic-retest': 'dynamic_retest_not_executed',
    },
    timeline: [
      {
        id: 'second',
        timestamp: '2026-09-09T10:02:00.000Z',
        label: 'Control campaign completed · target verification pending',
      },
      {
        id: 'first',
        timestamp: '2026-09-09T10:01:00.000Z',
        label: 'First action',
      },
    ],
  })
  renderReport()

  const timeline = screen.getByRole('list', { name: 'Session timeline' })
  const entries = within(timeline).getAllByRole('listitem')
  expect(entries[0]).toHaveTextContent('First action')
  expect(entries[1]).toHaveTextContent(
    'Control campaign completed · target verification pending',
  )
  expect(within(timeline).queryByText(/No operations/i)).not.toBeInTheDocument()
})

test('shows one provider-owned control completion from a real workflow', async () => {
  const user = userEvent.setup()
  renderReportWithOperations()

  await user.click(screen.getByRole('button', { name: 'run discovery' }))
  await waitFor(() => {
    expect(screen.getByRole('link', { name: 'Continue to finding analysis' })).toBeVisible()
  })
  await user.click(screen.getByRole('button', { name: 'run analysis' }))
  await waitFor(() => {
    expect(screen.getByRole('link', { name: 'Run control campaign' })).toBeVisible()
  })
  await user.click(screen.getByRole('button', { name: 'run controls' }))

  await waitFor(() => {
    const timeline = screen.getByRole('list', { name: 'Session timeline' })
    expect(
      within(timeline).getAllByText(
        'Control campaign completed \u00b7 target verification pending',
      ),
    ).toHaveLength(1)
  })

  const timeline = screen.getByRole('list', { name: 'Session timeline' })
  expect(timeline).not.toHaveTextContent(/simulation/i)
  expect(
    screen.getByText('External dynamic retest — NOT EXECUTED'),
  ).toBeVisible()
})

test('states indexed evidence, generated change sets, and pending target verification in the printable report', async () => {
  const user = userEvent.setup()
  const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'report',
    auditCompleted: true,
    validationResults: {
      'external-dynamic-retest': 'dynamic_retest_not_executed',
    },
  })
  renderReport()

  expect(
    screen.getByText('Report grounded in indexed local evidence'),
  ).toBeVisible()
  expect(
    screen.getByText(
      'Findings come from the indexed LNET TELCO source package; change sets are generated in the workspace; target verification remains pending.',
    ),
  ).toBeVisible()
  expect(
    screen.getByText('External dynamic retest — NOT EXECUTED'),
  ).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Print report/i }))
  expect(printSpy).toHaveBeenCalledOnce()
})

test('offers the same report as a downloadable PDF', async () => {
  const user = userEvent.setup()
  const createObjectUrl = vi.fn(() => 'blob:securepress-report')
  const revokeObjectUrl = vi.fn()
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectUrl,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectUrl,
  })
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined)
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'report',
    auditCompleted: true,
    validationResults: {
      'external-dynamic-retest': 'dynamic_retest_not_executed',
    },
  })
  renderReport()

  await user.click(screen.getByRole('button', { name: /Download report/i }))

  expect(createObjectUrl).toHaveBeenCalledOnce()
  expect(click).toHaveBeenCalledOnce()
  expect(revokeObjectUrl).toHaveBeenCalledWith('blob:securepress-report')
})
