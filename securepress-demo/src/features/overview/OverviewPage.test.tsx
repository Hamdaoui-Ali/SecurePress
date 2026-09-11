import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { telcoScenario } from '../../data/scenario'
import { getPreparedSource } from '../../services/source-adapter'
import { saveAssessment } from '../../services/storage'
import { OverviewPage } from './OverviewPage'

beforeEach(() => {
  localStorage.clear()
})

function readySourceState(
  overrides: Partial<ReturnType<typeof createInitialAssessment>> = {},
) {
  const initial = createInitialAssessment()
  return {
    ...initial,
    source: getPreparedSource(
      'C:\\SecurePress\\targets\\lnet-telco-wordpress',
      new Date('2026-09-11T10:00:00.000Z'),
    ),
    ...overrides,
  }
}

function renderOverview() {
  return render(
    <AssessmentProvider delayMs={0}>
      <HashRouter>
        <OverviewPage />
      </HashRouter>
    </AssessmentProvider>,
  )
}

test('shows only the verified source and the next action before discovery', () => {
  saveAssessment(readySourceState())
  renderOverview()

  expect(screen.getByText('Source verified')).toBeVisible()
  expect(screen.getByText('LNET TELCO WordPress source package')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Start discovery' })).toBeVisible()
  expect(screen.getByText('Evidence will appear as each operation completes.')).toBeVisible()
  expect(screen.queryByText('Indexed components')).not.toBeInTheDocument()
  expect(screen.queryByText('Findings available')).not.toBeInTheDocument()
  expect(screen.queryByText('Critical findings')).not.toBeInTheDocument()
  expect(screen.queryByText('Security posture score')).not.toBeInTheDocument()
})

test('reveals inventory but keeps findings hidden after discovery', () => {
  saveAssessment(
    readySourceState({
      stage: 'inventory',
      inventoryCompleted: true,
    }),
  )
  renderOverview()

  expect(screen.getByText('Indexed components')).toBeVisible()
  expect(screen.getByText(String(telcoScenario.inventory.components.length))).toBeVisible()
  expect(screen.getByRole('link', { name: 'Analyze findings' })).toBeVisible()
  expect(screen.queryByText('Findings available')).not.toBeInTheDocument()
  expect(screen.queryByText('Security posture score')).not.toBeInTheDocument()
})

test('reveals findings and posture only after finding analysis completes', () => {
  saveAssessment(
    readySourceState({
      stage: 'audit',
      inventoryCompleted: true,
      auditCompleted: true,
      visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
    }),
  )
  renderOverview()

  expect(screen.getByText('Findings available')).toBeVisible()
  expect(screen.getByText('Critical findings')).toBeVisible()
  expect(
    screen.getByRole('img', { name: /Security posture score: 42 out of 100/i }),
  ).toBeVisible()
  expect(screen.getByRole('link', { name: 'Review change sets' })).toBeVisible()
})

test('keeps the deterministic projected score tied to applied findings', () => {
  saveAssessment(
    readySourceState({
      stage: 'remediation',
      inventoryCompleted: true,
      auditCompleted: true,
      appliedFindingIds: ['F-001', 'F-002', 'F-003', 'F-004', 'F-007', 'F-009'],
    }),
  )

  renderOverview()

  expect(
    screen.getByRole('img', { name: /Security posture score: 82 out of 100/i }),
  ).toBeVisible()
  expect(screen.getByText('Projected, target verification required')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Run controls' })).toBeVisible()
})

test('shows completed operation activity with the recorded timestamp and duration', () => {
  saveAssessment(
    readySourceState({
      stage: 'inventory',
      inventoryCompleted: true,
      lastRun: {
        id: 'discovery-1',
        kind: 'discovery',
        status: 'completed',
        startedAt: '2026-09-10T10:00:00.000Z',
        completedAt: '2026-09-10T10:00:05.000Z',
        durationMs: 5_000,
        message: 'Discovery run completed · 22 components indexed',
        currentStep: 'Source inventory ready',
        processed: 22,
        total: 22,
      },
      operationHistory: [],
    }),
  )

  renderOverview()

  expect(screen.getByText('Discovery run completed · 22 components indexed')).toBeVisible()
  expect(screen.getByText('Completed in 5s')).toBeVisible()
  expect(
    screen.getByText((_, element) =>
      element?.tagName === 'TIME' &&
      element.getAttribute('datetime') === '2026-09-10T10:00:05.000Z',
    ),
  ).toBeVisible()
  expect(screen.getByRole('link', { name: 'Analyze findings' })).toBeVisible()
})
