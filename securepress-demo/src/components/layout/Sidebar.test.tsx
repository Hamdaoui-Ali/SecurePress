import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { beforeEach, expect, test, vi } from 'vitest'
import { AssessmentProvider, useAssessment } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { getPreparedSource } from '../../services/source-adapter'
import { saveAssessment } from '../../services/storage'
import { Sidebar } from './Sidebar'

beforeEach(() => {
  localStorage.clear()
})

function renderSidebar(overrides: Partial<ReturnType<typeof createInitialAssessment>> = {}) {
  const initial = createInitialAssessment()
  saveAssessment({
    ...initial,
    source: getPreparedSource(
      'C:\\SecurePress\\targets\\lnet-telco-wordpress',
      new Date('2026-09-11T10:00:00.000Z'),
    ),
    ...overrides,
  })

  return render(
    <AssessmentProvider delayMs={0}>
      <HashRouter>
        <SidebarWithState onStartGuidedDemo={vi.fn()} />
      </HashRouter>
    </AssessmentProvider>,
  )
}

function SidebarWithState({ onStartGuidedDemo }: { onStartGuidedDemo: () => void }) {
  const { state } = useAssessment()
  return <Sidebar busy={false} state={state} onStartGuidedDemo={onStartGuidedDemo} />
}

test('explains why future workflow steps are locked before discovery', () => {
  renderSidebar()

  const lockedAnalysis = screen.getByText('Finding analysis').closest('[aria-disabled="true"]')
  expect(lockedAnalysis).toBeVisible()
  expect(lockedAnalysis).toHaveAttribute(
    'aria-label',
    expect.stringContaining('discovery is complete'),
  )
  expect(
    screen.queryByRole('link', { name: 'Finding analysis' }),
  ).not.toBeInTheDocument()
})

test('turns finding analysis into a link after discovery completes', () => {
  renderSidebar({
    stage: 'inventory',
    inventoryCompleted: true,
  })

  expect(screen.getByRole('link', { name: 'Finding analysis' })).toBeVisible()
  const lockedChangeSets = screen.getByText('Change sets').closest('[aria-disabled="true"]')
  expect(lockedChangeSets).toBeVisible()
  expect(lockedChangeSets).toHaveAttribute(
    'aria-label',
    expect.stringContaining('finding analysis is complete'),
  )
})
