import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  renderInventory(500)

  fireEvent.click(screen.getByRole('button', { name: 'Run discovery' }))

  await waitFor(() => {
    expect(screen.getByText('Component summary')).toBeVisible()
  }, { timeout: 10_000 })

  await waitFor(
    () => {
      expect(screen.getByText('Workspace ready')).toBeVisible()
    },
    { timeout: 10_000 },
  )
  expect(screen.getByText('22 components indexed')).toBeVisible()
  expect(screen.getByRole('table')).toBeVisible()
  expect(document.body.textContent).not.toMatch(/demo|simul/i)
})

test('keeps indexed components available while a repeated discovery shows progress', async () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'inventory',
    inventoryCompleted: true,
  })

  renderInventory(25)

  fireEvent.click(screen.getByRole('button', { name: 'Run discovery again' }))

  await waitFor(() => {
    expect(screen.getByText('Component summary')).toBeVisible()
  }, { timeout: 10_000 })
  expect(screen.getByRole('table')).toBeVisible()
  await waitFor(() => {
    expect(screen.getByText('Workspace ready')).toBeVisible()
  }, { timeout: 5_000 })
})
