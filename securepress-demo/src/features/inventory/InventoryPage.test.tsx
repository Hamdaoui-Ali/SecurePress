import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HashRouter } from 'react-router'
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
      <HashRouter>
        <InventoryPage />
      </HashRouter>
    </AssessmentProvider>,
  )
}

test('runs discovery with phase progress and waits to expose the indexed table', async () => {
  const { container } = renderInventory(500)
  const liveProgress = container.querySelector('.inventory-progress-live')

  fireEvent.click(screen.getByRole('button', { name: 'Run discovery' }))

  await waitFor(() => {
    const discoveryButton = screen.getByRole('button', { name: 'Discovery in progress' })
    expect(discoveryButton).toBeDisabled()
    expect(discoveryButton).toHaveAttribute('aria-busy', 'true')
    expect(liveProgress).toBeVisible()
    expect(liveProgress).toHaveTextContent(
      /Preparing source package|Indexing .+|Source inventory ready/,
    )
  }, { timeout: 10_000 })

  await waitFor(() => expect(screen.getByRole('table')).toBeVisible(), { timeout: 20_000 })
  expect(screen.getByText(/Indexing \d+ of 22 components from the local source/)).toBeVisible()
  await waitFor(() => expect(screen.getByText('Workspace ready')).toBeVisible(), { timeout: 20_000 })
  expect(screen.getByText('22 components indexed')).toBeVisible()
  expect(screen.getByRole('table')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Continue to finding analysis' })).toBeVisible()
  expect(document.body.textContent).not.toMatch(/demo|simul/i)
})

test('keeps indexed components available while a repeated discovery shows progress', async () => {
  saveAssessment({
    ...createInitialAssessment(),
    stage: 'inventory',
    inventoryCompleted: true,
  })

  const { container } = renderInventory(25)
  const liveProgress = container.querySelector('.inventory-progress-live')

  fireEvent.click(screen.getByRole('button', { name: 'Run discovery again' }))

  await waitFor(() => {
    const discoveryButton = screen.getByRole('button', { name: 'Discovery in progress' })
    expect(discoveryButton).toBeDisabled()
    expect(discoveryButton).toHaveAttribute('aria-busy', 'true')
    expect(liveProgress).toBeVisible()
    expect(liveProgress).toHaveTextContent(
      /Preparing source package|Indexing .+|Source inventory ready/,
    )
  }, { timeout: 10_000 })
  expect(screen.getByRole('table')).toBeVisible()
  await waitFor(() => {
    expect(screen.getByText('Workspace ready')).toBeVisible()
  }, { timeout: 5_000 })
  expect(screen.getByRole('link', { name: 'Continue to finding analysis' })).toBeVisible()
})
