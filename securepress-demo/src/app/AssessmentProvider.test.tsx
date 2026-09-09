import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { STORAGE_KEY } from '../services/storage'
import { AssessmentProvider, useAssessment } from './AssessmentProvider'

function AssessmentProbe() {
  const { state, busy, progress, runInventory, resetDemo } = useAssessment()

  return (
    <div>
      <output data-testid="stage">{state.stage}</output>
      <output data-testid="busy">{String(busy)}</output>
      <output data-testid="progress">{progress?.message ?? 'idle'}</output>
      <button type="button" onClick={() => void runInventory()}>
        lancer inventaire
      </button>
      <button type="button" onClick={resetDemo}>
        reset
      </button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

test('persiste une transition réussie et réinitialise l’état', async () => {
  const user = userEvent.setup()
  render(
    <AssessmentProvider delayMs={0}>
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer inventaire' }))

  expect(screen.getByTestId('stage')).toHaveTextContent('inventory')
  expect(localStorage.getItem(STORAGE_KEY)).toContain('inventoryCompleted')

  await user.click(screen.getByRole('button', { name: 'reset' }))

  expect(screen.getByTestId('stage')).toHaveTextContent('overview')
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})
