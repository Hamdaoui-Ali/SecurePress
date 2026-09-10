import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router'
import { beforeEach, expect, test, vi } from 'vitest'
import { AssessmentProvider, useAssessment } from '../../app/AssessmentProvider'
import { AppShell } from './AppShell'

function OperationControls() {
  const { runInventory, runStaticAudit } = useAssessment()

  return (
    <div>
      <button type="button" onClick={() => void runInventory()}>
        Run discovery
      </button>
      <button type="button" onClick={() => void runStaticAudit()}>
        Run analysis
      </button>
    </div>
  )
}

function renderShell(delayMs = 0) {
  const onReset = vi.fn()
  render(
    <AssessmentProvider delayMs={delayMs}>
      <HashRouter>
        <AppShell onReset={onReset} onStartGuidedDemo={vi.fn()}>
          <OperationControls />
          <p>Test content</p>
        </AppShell>
      </HashRouter>
    </AssessmentProvider>,
  )

  return { onReset }
}

beforeEach(() => {
  localStorage.clear()
})

test('shows truthful workspace context and an empty operational activity state', () => {
  renderShell()

  expect(
    screen.getByRole('complementary', { name: 'Workspace context' }),
  ).toHaveTextContent('TELCO workspace')
  expect(screen.getByText('Source package · indexed')).toBeVisible()
  expect(screen.getByText('Target verification required')).toBeVisible()
  expect(screen.getByText('No recent operations')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Reset workspace' }),
  ).toBeVisible()
  expect(screen.queryByText('MODE DÉMO')).not.toBeInTheDocument()
  expect(
    screen.queryByText(/Aucun système réel n’est connecté/i),
  ).not.toBeInTheDocument()
})

test('renders provider-backed discovery progress while an operation is running', async () => {
  const user = userEvent.setup()
  renderShell(500)

  await user.click(screen.getByRole('button', { name: 'Run discovery' }))

  await waitFor(() => {
    const progressbar = screen.getByRole('progressbar', {
      name: 'Discovery run progress',
    })
    expect(progressbar).not.toHaveAttribute('aria-valuenow', '100')
  })
  expect(screen.getByText('Discovery run in progress')).toBeVisible()
  expect(
    screen.getByText(
      /Read TELCO source package|Index WordPress core|Inventory themes|Inventory plugins|Review configuration|Component summary/,
    ),
  ).toBeVisible()
  expect(screen.getByText(/of 22 processed/)).toBeVisible()
  expect(screen.getAllByText('Running')[0]).toBeVisible()
})

test('shows the latest completed operation and its compact recent activity', async () => {
  const user = userEvent.setup()
  renderShell()

  await user.click(screen.getByRole('button', { name: 'Run discovery' }))

  await waitFor(() => {
    expect(
      screen.getByText('Discovery run completed · 22 components indexed'),
    ).toBeVisible()
  })
  await user.click(screen.getByRole('button', { name: 'Run analysis' }))

  await waitFor(() => {
    expect(
      screen.getByText('Finding analysis completed · 10 findings'),
    ).toBeVisible()
  })
  expect(screen.getAllByText('Completed')[0]).toBeVisible()
  expect(screen.getByText(/Completed in /)).toBeVisible()
  expect(screen.getByRole('list', { name: 'Recent operations' })).toHaveTextContent(
    'Discovery run completed · 22 components indexed',
  )
})

test('shows a failed operation without creating independent shell state', async () => {
  const user = userEvent.setup()
  renderShell()

  await user.click(screen.getByRole('button', { name: 'Run analysis' }))

  await waitFor(() => {
    expect(
      screen.getByText(
        'Finding analysis failed: inventory is required before analysis can run.',
      ),
    ).toBeVisible()
  })
  expect(screen.getAllByText('Failed')[0]).toBeVisible()
})

test('preserves the reset confirmation flow with the workspace label', async () => {
  const user = userEvent.setup()
  const { onReset } = renderShell()

  await user.click(screen.getByRole('button', { name: 'Reset workspace' }))

  expect(screen.getByRole('dialog')).toHaveAccessibleName('Reset workspace?')
  expect(onReset).not.toHaveBeenCalled()
})
