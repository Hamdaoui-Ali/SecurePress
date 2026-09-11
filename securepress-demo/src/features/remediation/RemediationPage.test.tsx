import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { HashRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import * as engineModule from '../../services/simulation-engine'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment, type AssessmentState } from '../../domain/models'
import { telcoScenario } from '../../data/scenario'
import { STORAGE_KEY, saveAssessment } from '../../services/storage'
import { RemediationPage } from './RemediationPage'

beforeEach(() => {
  localStorage.clear()
})

function completedAuditState(): AssessmentState {
  return {
    ...createInitialAssessment(),
    stage: 'audit',
    inventoryCompleted: true,
    auditCompleted: true,
    visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
  }
}

function createNow(...timestamps: string[]) {
  let index = 0
  return () => new Date(timestamps[Math.min(index++, timestamps.length - 1)]!)
}

function renderRemediation({
  delayMs = 0,
  now,
}: {
  delayMs?: number
  now?: () => Date
} = {}) {
  return render(
    <AssessmentProvider delayMs={delayMs} now={now}>
      <HashRouter>
        <RemediationPage />
      </HashRouter>
    </AssessmentProvider>,
  )
}

test('keeps correction cards hidden until finding analysis completes', () => {
  renderRemediation()

  expect(screen.getByText('Complete finding analysis before preparing a change set')).toBeVisible()
  expect(screen.queryByRole('article', { name: /F-001/i })).not.toBeInTheDocument()
})

test('offers a continuation to controls after a change set is applied', () => {
  saveAssessment({
    ...completedAuditState(),
    stage: 'remediation',
    appliedFindingIds: ['F-001'],
  })
  renderRemediation()

  expect(screen.getByRole('link', { name: 'Continue to controls' })).toBeVisible()
})

test('shows a staged local change set with before and after evidence', () => {
  saveAssessment(completedAuditState())
  renderRemediation()

  expect(screen.getByText(/root/i)).toBeVisible()
  expect(screen.getByText(/telco_app/i)).toBeVisible()
  expect(
    within(document.getElementById('remediation-F-001')!).getByText(
      'Change set staged',
    ),
  ).toBeVisible()
  expect(screen.getByText('Priority correction')).toBeVisible()
  expect(screen.getByText('Additional change sets (9)')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  ).toBeEnabled()
})

test('associates a real dependency-phase failure through later activity, reload, and retry', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  const createEngine = engineModule.createSimulationEngine
  let failOnce = true
  const factory = vi.spyOn(engineModule, 'createSimulationEngine').mockImplementation(options =>
    createEngine({ ...options, onProgress: update => {
      options.onProgress?.(update)
      if (failOnce && update.step === 'Checking change-set dependencies') {
        failOnce = false
        throw new Error('DEPENDENCY_UNAVAILABLE')
      }
    } }),
  )
  try {
    const view = renderRemediation()
    await user.click(screen.getByRole('button', { name: 'Apply change set · F-001' }))
    expect(await screen.findByText('Change set failed · F-001')).toBeVisible()
    const failed = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(failed.appliedFindingIds).toEqual([])
    expect(failed.lastRun).toMatchObject({
      findingId: 'F-001', status: 'failed', currentStep: 'Checking change-set dependencies',
      message: 'Change set failed: an unexpected operation error occurred.',
    })
    await user.click(screen.getByRole('button', { name: 'Apply change set · F-002' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Change set applied · F-002' })).toBeDisabled())
    expect(screen.getByText('Change set failed · F-001')).toBeVisible()
    view.unmount()
    renderRemediation()
    expect(screen.getByText('Change set failed · F-001')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Apply change set · F-001' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Change set applied · F-001' })).toBeDisabled())
    expect(screen.queryByText('Change set failed · F-001')).not.toBeInTheDocument()
    const retried = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(retried.appliedFindingIds).toEqual(['F-002', 'F-001'])
    expect(retried.operationHistory).toHaveLength(3)
    expect(retried.operationHistory.filter((run: { findingId: string }) => run.findingId === 'F-001').map((run: { status: string }) => run.status)).toEqual(['completed', 'failed'])
  } finally {
    factory.mockRestore()
  }
})

test('shows the provider change-set phase without updating score or findings early', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderRemediation({ delayMs: 500 })

  await user.click(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  )

  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: 'Applying change set · F-001' }),
    ).toBeVisible()
    expect(screen.getByText(/Change set phase ·/)).toBeVisible()
  }, { timeout: 5_000 })
  expect(screen.getByText('42 / 100')).toBeVisible()
  expect(screen.getByText('0')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Applying change set · F-001' }),
  ).toBeDisabled()
  await waitFor(() => expect(
    screen.getByRole('button', { name: 'Change set applied · F-001' }),
  ).toBeDisabled(), { timeout: 3_000 })
})

test('records a completed change set and persists its activity after the final phase', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderRemediation({
    now: createNow('2026-09-10T10:00:00.000Z', '2026-09-10T10:00:05.000Z'),
  })

  await user.click(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  )

  await waitFor(() => {
    expect(screen.getByText('Change set applied')).toBeVisible()
  })
  expect(screen.getByText('Workspace update recorded · 5s')).toBeVisible()
  expect(
    within(document.getElementById('remediation-F-001')!).getByText(
      'Target verification required',
    ),
  ).toBeVisible()
  expect(screen.getByText('54 / 100')).toBeVisible()
  expect(screen.getByText('1')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Change set applied · F-001' }),
  ).toBeDisabled()

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.appliedFindingIds).toEqual(['F-001'])
  expect(saved.operationHistory).toEqual([
    expect.objectContaining({
      kind: 'change-set',
      status: 'completed',
      message: 'Change set applied · F-001',
      durationMs: 5000,
    }),
  ])
  expect(saved.timeline).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ label: 'Change set applied · F-001' }),
    ]),
  )
})

test('shows a failed change set as retryable provider state', () => {
  const failedRun = {
    id: 'change-set-2026-09-10T11:00:00.000Z-1',
    kind: 'change-set' as const,
    status: 'failed' as const,
    startedAt: '2026-09-10T11:00:00.000Z',
    completedAt: '2026-09-10T11:00:02.000Z',
    durationMs: 2000,
    message: 'Change set failed · F-001: the requested finding could not be found.',
  }
  saveAssessment({
    ...completedAuditState(),
    lastRun: failedRun,
    operationHistory: [failedRun],
  })
  renderRemediation()

  expect(screen.getByText('Change set failed · F-001')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  ).toBeEnabled()
})

test('retains a failed change set after a later provider operation completes', () => {
  const failedRun = {
    id: 'change-set-2026-09-10T11:00:00.000Z-1',
    kind: 'change-set' as const,
    status: 'failed' as const,
    startedAt: '2026-09-10T11:00:00.000Z',
    completedAt: '2026-09-10T11:00:02.000Z',
    durationMs: 2000,
    message: 'Change set failed · F-001: the requested finding could not be found.',
  }
  const laterRun = {
    id: 'discovery-2026-09-10T11:10:00.000Z-1',
    kind: 'discovery' as const,
    status: 'completed' as const,
    startedAt: '2026-09-10T11:10:00.000Z',
    completedAt: '2026-09-10T11:10:04.000Z',
    durationMs: 4000,
    message: 'Discovery run completed · 22 components indexed',
  }
  saveAssessment({
    ...completedAuditState(),
    lastRun: laterRun,
    operationHistory: [laterRun, failedRun],
  })
  renderRemediation()

  expect(screen.getByText('Change set failed · F-001')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  ).toBeEnabled()
})

test('keeps artifact previews scoped to generated workspace artifacts', () => {
  saveAssessment(completedAuditState())
  renderRemediation()

  fireEvent.click(screen.getByText('Additional change sets (9)'))

  expect(screen.getAllByText('Target verification required')).toHaveLength(2)
  expect(screen.getByText('Referenced artifact not present')).toBeVisible()
  expect(screen.getAllByText('Generated workspace artifact · proposed change set')).toHaveLength(3)
  expect(screen.getAllByText(/DISALLOW_FILE_EDIT/).at(-1)).toBeVisible()
  expect(screen.getAllByText(/FORCE_SSL_ADMIN/).at(-1)).toBeVisible()
  expect(screen.getAllByText(/wp-cli/i).at(-1)).toBeVisible()
})

test('removes the old simulation disclaimer and prevents duplicate application', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderRemediation()

  expect(
    screen.queryByText('Aucune configuration réelle n’a été modifiée'),
  ).not.toBeInTheDocument()

  await user.click(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  )
  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: 'Change set applied · F-001' }),
    ).toBeDisabled()
  })

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  expect(saved.appliedFindingIds).toEqual(['F-001'])
  expect(saved.operationHistory).toHaveLength(1)
})
