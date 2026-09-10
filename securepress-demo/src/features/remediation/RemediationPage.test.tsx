import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
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
      <RemediationPage />
    </AssessmentProvider>,
  )
}

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
  expect(
    screen.getByRole('button', { name: 'Apply change set · F-001' }),
  ).toBeEnabled()
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

  expect(screen.getAllByText('Target verification required')).toHaveLength(2)
  expect(screen.getByText('Artefact mentionné mais absent')).toBeVisible()
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
