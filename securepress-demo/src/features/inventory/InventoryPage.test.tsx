import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { AssessmentProvider } from '../../app/AssessmentProvider'
import { createInitialAssessment } from '../../domain/models'
import { saveAssessment } from '../../services/storage'
import { InventoryPage } from './InventoryPage'

beforeEach(() => {
  localStorage.clear()
})

function renderInventory(delayMs = 0) {
  return render(
    <AssessmentProvider delayMs={delayMs}>
      <InventoryPage />
    </AssessmentProvider>,
  )
}

test('runs discovery with phase progress and waits to expose the indexed table', async () => {
  const user = userEvent.setup()
  renderInventory(500)

  await user.click(screen.getByRole('button', { name: 'Run discovery' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Discovery in progress' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Discovery in progress' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.getByText('Read TELCO source package')).toBeVisible()
  })
  expect(screen.queryByRole('table')).not.toBeInTheDocument()

  await waitFor(
    () => {
      expect(screen.getByText('Workspace ready')).toBeVisible()
    },
    { timeout: 3_000 },
  )
  expect(screen.getByText('22 components indexed')).toBeVisible()
  expect(screen.getByRole('table')).toBeVisible()
  expect(document.body.textContent).not.toMatch(/demo|simul/i)
})

test('keeps indexed components available while a repeated discovery shows progress', async () => {
  const user = userEvent.setup()
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'inventory',
    inventoryCompleted: true,
  })

  renderInventory(25)

  await user.click(screen.getByRole('button', { name: 'Run discovery again' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Discovery in progress' })).toBeDisabled()
    expect(screen.getByText('Read TELCO source package')).toBeVisible()
  })
  expect(screen.getByRole('table')).toBeVisible()
  await waitFor(() => {
    expect(screen.getByText('Workspace ready')).toBeVisible()
  })
})
