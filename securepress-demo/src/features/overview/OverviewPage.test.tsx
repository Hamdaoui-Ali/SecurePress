import { render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { saveAssessment } from '../../services/storage'
import { OverviewPage } from './OverviewPage'

beforeEach(() => {
  localStorage.clear()
})

function renderOverview() {
  return render(
    <AssessmentProvider delayMs={0}>
      <OverviewPage />
    </AssessmentProvider>,
  )
}

test('presents deterministic workspace posture and next operational action', () => {
  renderOverview()

  expect(screen.getByText('Indexed components')).toBeVisible()
  expect(screen.getByText('22')).toBeVisible()
  expect(screen.getByText('TELCO source package')).toBeVisible()
  expect(screen.getByText('Findings available')).toBeVisible()
  expect(
    screen.getByRole('img', { name: /Security posture score: 42 out of 100/i }),
  ).toBeVisible()
  expect(screen.getByText('Security posture score')).toBeVisible()
  expect(screen.getByText('Run discovery')).toBeVisible()
  expect(document.body.textContent).not.toMatch(/demo|simul/i)
})

test('keeps the deterministic score transition tied to applied findings', () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'remediation',
    appliedFindingIds: ['F-001', 'F-002', 'F-003', 'F-004', 'F-007', 'F-009'],
  })

  renderOverview()

  expect(
    screen.getByRole('img', { name: /Security posture score: 82 out of 100/i }),
  ).toBeVisible()
  expect(screen.getByText('Projected, target verification required')).toBeVisible()
})

test('shows completed operation activity with the recorded timestamp and duration', () => {
  saveAssessment({
    ...createInitialAssessment(),
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
      currentStep: 'Component summary',
      processed: 22,
      total: 22,
    },
    operationHistory: [],
  })

  renderOverview()

  expect(screen.getByText('Discovery run completed · 22 components indexed')).toBeVisible()
  expect(screen.getByText('Completed in 5s')).toBeVisible()
  expect(
    screen.getByText((_, element) =>
      element?.tagName === 'TIME' &&
      element.getAttribute('datetime') === '2026-09-10T10:00:05.000Z',
    ),
  ).toBeVisible()
  expect(screen.getByText('Analyze findings')).toBeVisible()
})
