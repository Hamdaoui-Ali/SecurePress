import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useEffect } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'
import { AssessmentProvider, useAssessment, type AssessmentContextValue } from './AssessmentProvider'
import { createInitialAssessment } from '../domain/models'
import { saveAssessment, STORAGE_KEY } from '../services/storage'
import { GuidedDemo } from '../components/workflow/GuidedDemo'

let assessment: AssessmentContextValue

function captureAssessment(value: AssessmentContextValue) {
  assessment = value
}

function Probe() {
  const value = useAssessment()
  useEffect(() => captureAssessment(value), [value])
  return null
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

function renderProvider(guided = false) {
  return render(<AssessmentProvider delayMs={120}>
    <Probe />
    {guided ? <MemoryRouter><GuidedDemo /></MemoryRouter> : null}
  </AssessmentProvider>)
}

async function completePhases() {
  await act(async () => {})
  // Flush React between timer ticks so elapsed-time intervals are cleaned up
  // when the operation completes. Advance timers, never sleep on wall time.
  for (let tick = 0; vi.getTimerCount() > 0 && tick < 100; tick++) {
    await act(async () => { await vi.advanceTimersToNextTimerAsync() })
  }
  await act(async () => {})
  expect(vi.getTimerCount()).toBe(0)
}

test('repeated campaigns process again while applied change sets leave no new activity', async () => {
  saveAssessment({ ...createInitialAssessment(), auditCompleted: true })
  renderProvider()
  act(() => { void assessment.applyRemediation('F-001') })
  await completePhases()
  const applied = assessment.state
  const stored = localStorage.getItem(STORAGE_KEY)
  await act(async () => { await assessment.applyRemediation('F-001') })
  expect(assessment.state).toBe(applied)
  expect(localStorage.getItem(STORAGE_KEY)).toBe(stored)
  expect(assessment.activeOperation).toBeNull()

  for (let run = 0; run < 2; run++) {
    act(() => { void assessment.runValidation() })
    expect(assessment.busy).toBe(true)
    expect(assessment.activeOperation).toMatchObject({ status: 'running', processed: 0, total: 10 })
    await completePhases()
    expect(assessment.lastRun).toMatchObject({
      status: 'completed', currentStep: 'Clôture de la campagne', processed: 10, total: 10,
    })
    expect(assessment.state.timeline).toHaveLength(run + 2)
  }
  const campaigns = assessment.operationHistory.filter(run => run.kind === 'controls')
  expect(campaigns).toHaveLength(2)
  expect(campaigns[0].id).not.toBe(campaigns[1].id)
})

test.each(['exit', 'next', 'previous'] as const)('completion preserves guide %s during a discovery phase', async (action) => {
  saveAssessment({ ...createInitialAssessment(), guidedStep: 2 })
  renderProvider()
  act(() => { void assessment.runInventory() })
  expect(assessment.busy).toBe(true)
  act(() => {
    if (action === 'exit') assessment.exitGuidedDemo()
    if (action === 'next') assessment.nextGuidedStep()
    if (action === 'previous') assessment.previousGuidedStep()
  })
  const expectedStep = action === 'exit' ? null : action === 'next' ? 3 : 1
  expect(assessment.state.guidedStep).toBe(expectedStep)
  await completePhases()
  expect(assessment.state.inventoryCompleted).toBe(true)
  expect(assessment.state.guidedStep).toBe(expectedStep)
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).guidedStep).toBe(expectedStep)
})

test('manual remediation and campaign followed by guided next do not manufacture duplicate runs', async () => {
  saveAssessment({ ...createInitialAssessment(), auditCompleted: true, guidedStep: 4 })
  renderProvider(true)
  act(() => { void assessment.applyRemediation('F-001') })
  expect(screen.getByRole('button', { name: 'En cours…' })).toBeDisabled()
  await completePhases()
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
  await completePhases()
  expect(assessment.state.guidedStep).toBe(5)
  expect(assessment.operationHistory).toHaveLength(6)
  expect(assessment.operationHistory.filter(run => run.message.endsWith('F-001'))).toHaveLength(1)
  act(() => { void assessment.runValidation() })
  await completePhases()
  const history = assessment.operationHistory
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
  await completePhases()
  expect(assessment.state.guidedStep).toBe(6)
  expect(assessment.operationHistory).toEqual(history)
})

test.each(['Quitter le guide', 'Précédent'])('guided batch stops after %s during an awaited phase', async (action) => {
  saveAssessment({ ...createInitialAssessment(), auditCompleted: true, guidedStep: 4 })
  renderProvider(true)
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
  expect(assessment.busy).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: action }))
  await completePhases()
  expect(assessment.state.guidedStep).toBe(action === 'Précédent' ? 3 : null)
  expect(assessment.state.appliedFindingIds).toEqual(['F-001'])
  expect(assessment.operationHistory).toHaveLength(1)
})

test('a failed guided operation keeps its step available for retry', async () => {
  saveAssessment({ ...createInitialAssessment(), guidedStep: 4 })
  renderProvider(true)
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
  await completePhases()
  expect(assessment.lastRun?.status).toBe('failed')
  expect(assessment.state.guidedStep).toBe(4)
  expect(assessment.operationHistory).toHaveLength(1)
  expect(screen.getByRole('button', { name: 'Suivant' })).toBeEnabled()
})

test.each(['reset', 'guided-start'] as const)('disables %s and its already-open confirmation while discovery runs', async (action) => {
  window.location.hash = '/inventaire'
  render(<App />)
  const reset = screen.getByRole('button', { name: 'Reset workspace' })
  const guidedStart = screen.getByRole('button', { name: 'Démarrer le parcours guidé' })
  fireEvent.click(action === 'reset' ? reset : guidedStart)
  const dialog = screen.getByRole('dialog')
  const confirmation = within(dialog).getByRole('button', { name: 'Confirmer la réinitialisation' })
  // An operation can start after the dialog opens: exercise that race directly.
  fireEvent.click(screen.getByRole('button', { name: 'Run discovery' }))
  expect(screen.getByRole('progressbar', { name: 'Discovery run progress' })).toBeVisible()
  expect(reset).toBeDisabled()
  expect(guidedStart).toBeDisabled()
  expect(confirmation).toBeDisabled()
  fireEvent.click(confirmation)
  expect(dialog).toBeVisible()
  expect(window.location.hash).toBe('#/inventaire')
  await completePhases()
  expect(confirmation).toBeEnabled()
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).inventoryCompleted).toBe(true)
  fireEvent.click(confirmation)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(window.location.hash).toBe('#/')
  if (action === 'reset') expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  else expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ guidedStep: 0, inventoryCompleted: false })
})
