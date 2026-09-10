import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { telcoScenario } from '../../data/scenario'
import { saveAssessment } from '../../services/storage'
import { AuditPage } from './AuditPage'

beforeEach(() => {
  localStorage.clear()
})

function renderAudit(delayMs = 0) {
  return render(
    <AssessmentProvider delayMs={delayMs}>
      <AuditPage />
    </AssessmentProvider>,
  )
}

function completedInventoryState() {
  return {
    ...createInitialAssessment(),
    stage: 'inventory' as const,
    inventoryCompleted: true,
  }
}

function completedAuditState() {
  return {
    ...completedInventoryState(),
    stage: 'audit' as const,
    auditCompleted: true,
    visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
  }
}

test('requires discovery before finding analysis', () => {
  renderAudit()

  expect(screen.getByRole('button', { name: 'Analyze findings' })).toBeDisabled()
  expect(screen.getByText('Run discovery before analyzing findings')).toBeVisible()
})

test('runs finding analysis with phase progress before exposing findings', async () => {
  const user = userEvent.setup()
  saveAssessment(completedInventoryState())
  renderAudit(500)

  await user.click(screen.getByRole('button', { name: 'Analyze findings' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Finding analysis in progress' })).toBeDisabled()
    expect(
      screen.getByText(
        /Load findings|Analyze evidence|Correlate risk and remediation|Complete finding analysis/,
      ),
    ).toBeVisible()
  }, { timeout: 5_000 })
  expect(screen.queryByRole('table')).not.toBeInTheDocument()

  await waitFor(
    () => {
      expect(screen.getByText('Finding analysis completed')).toBeVisible()
    },
    { timeout: 10_000 },
  )
  expect(screen.getByText('2 critical')).toBeVisible()
  expect(screen.getByText('3 high')).toBeVisible()
  expect(screen.getByText('3 medium')).toBeVisible()
  expect(screen.getByText('1 low')).toBeVisible()
  expect(screen.getByText('1 variable')).toBeVisible()
  expect(screen.getAllByRole('row')).toHaveLength(11)
  expect(document.body.textContent).not.toMatch(/demo|simul/i)
})

test('keeps qualified findings available while repeated analysis shows progress', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderAudit(100)

  await user.click(screen.getByRole('button', { name: 'Analyze findings again' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Finding analysis in progress' })).toBeDisabled()
    expect(
      screen.getByText(
        /Load findings|Analyze evidence|Correlate risk and remediation|Complete finding analysis/,
      ),
    ).toBeVisible()
  }, { timeout: 5_000 })
  expect(screen.getByRole('table')).toBeVisible()
  await waitFor(() => {
    expect(screen.getByText('Finding analysis completed')).toBeVisible()
  }, { timeout: 5_000 })
})

test('explains F-001 and F-006 in the evidence drawer', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderAudit()

  await user.click(screen.getByRole('button', { name: /Open F-001/i }))
  const firstDialog = screen.getByRole('dialog')
  expect(firstDialog).toBeVisible()
  expect(within(firstDialog).getByText('Critique')).toBeVisible()
  expect(within(firstDialog).getByText('Observed in package')).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'Close' }))
  await user.click(screen.getByRole('button', { name: /Open F-006/i }))
  const secondDialog = screen.getByRole('dialog')
  expect(secondDialog).toBeVisible()
  expect(within(secondDialog).getAllByText(/Exploitability is unknown/i)[0]).toBeVisible()
})

test('filters critical findings and restores all rows', async () => {
  const user = userEvent.setup()
  saveAssessment(completedAuditState())
  renderAudit()

  await user.selectOptions(screen.getByLabelText('Sévérité'), 'critical')

  expect(screen.getAllByRole('row')).toHaveLength(3)
  expect(screen.getByText('F-001')).toBeVisible()
  expect(screen.getByText('F-002')).toBeVisible()
  expect(screen.queryByText('F-003')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Effacer les filtres/i }))
  expect(screen.getAllByRole('row')).toHaveLength(11)
})
