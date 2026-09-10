import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { STORAGE_KEY } from '../services/storage'
import { AssessmentProvider, useAssessment } from './AssessmentProvider'

function AssessmentProbe() {
  const {
    state,
    activeOperation,
    busy,
    progress,
    lastRun,
    operationHistory,
    runInventory,
    runStaticAudit,
    applyRemediation,
    runHardeningCheck,
    runValidation,
    startGuidedDemo,
    nextGuidedStep,
    previousGuidedStep,
    exitGuidedDemo,
    resetDemo,
  } = useAssessment()

  return (
    <div>
      <output data-testid="stage">{state.stage}</output>
      <output data-testid="guided-step">{state.guidedStep ?? 'none'}</output>
      <output data-testid="busy">{String(busy)}</output>
      <output data-testid="progress">{progress?.message ?? 'idle'}</output>
      <output data-testid="active-operation">
        {activeOperation ? JSON.stringify(activeOperation) : 'idle'}
      </output>
      <output data-testid="last-run">
        {lastRun ? JSON.stringify(lastRun) : 'none'}
      </output>
      <output data-testid="history">{JSON.stringify(operationHistory)}</output>
      <output data-testid="timeline">{JSON.stringify(state.timeline)}</output>
      <button type="button" onClick={() => void runInventory()}>
        lancer inventaire
      </button>
      <button type="button" onClick={() => void runStaticAudit()}>
        lancer analyse
      </button>
      <button type="button" onClick={() => void applyRemediation('F-001')}>
        appliquer F-001
      </button>
      <button
        type="button"
        onClick={() => void runHardeningCheck('V-FILE-EDITOR')}
      >
        contrÃ´ler V-FILE-EDITOR
      </button>
      <button type="button" onClick={() => void runValidation()}>
        lancer campagne
      </button>
      <button type="button" onClick={startGuidedDemo}>
        start guided
      </button>
      <button type="button" onClick={nextGuidedStep}>
        next guided
      </button>
      <button type="button" onClick={previousGuidedStep}>
        previous guided
      </button>
      <button type="button" onClick={exitGuidedDemo}>
        exit guided
      </button>
      <button type="button" onClick={resetDemo}>
        reset
      </button>
    </div>
  )
}

function readJson<T>(testId: string): T {
  return JSON.parse(screen.getByTestId(testId).textContent ?? '') as T
}

function createNow(...timestamps: string[]) {
  let index = 0

  return () => new Date(timestamps[Math.min(index++, timestamps.length - 1)]!)
}

async function waitForStage(stage: string) {
  await waitFor(() => {
    expect(screen.getByTestId('stage')).toHaveTextContent(stage)
    expect(screen.getByTestId('busy')).toHaveTextContent('false')
  }, { timeout: 3_000 })
}

beforeEach(() => {
  localStorage.clear()
})

test('exposes a running discovery operation and persists its completed metadata', async () => {
  const user = userEvent.setup()
  const now = createNow(
    '2026-09-10T10:00:00.000Z',
    '2026-09-10T10:00:05.000Z',
    '2026-09-10T10:00:10.000Z',
  )
  render(
    <AssessmentProvider delayMs={250} now={now}>
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer inventaire' }))

  await waitFor(() => {
    expect(screen.getByTestId('busy')).toHaveTextContent('true')
    expect(screen.getByTestId('progress')).toHaveTextContent(
      'Lecture du package TELCO',
    )
    expect(
      readJson<{
        kind: string
        status: string
        currentStep: string
        processed: number
        total: number
      }>('active-operation'),
    ).toMatchObject({
      kind: 'discovery',
      status: 'running',
      currentStep: 'Lecture du package TELCO',
      processed: 0,
      total: 22,
    })
  })
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

  await waitForStage('inventory')

  expect(screen.getByTestId('active-operation')).toHaveTextContent('idle')
  expect(
    readJson<{
      status: string
      startedAt: string
      completedAt: string
      durationMs: number
      message: string
      currentStep: string
      processed: number
      total: number
    }>('last-run'),
  ).toMatchObject({
    status: 'completed',
    startedAt: '2026-09-10T10:00:00.000Z',
    completedAt: '2026-09-10T10:00:10.000Z',
    durationMs: 10_000,
    message: 'Discovery run completed \u00b7 17 components indexed',
    currentStep: 'Synth\u00e8se des composants',
    processed: 22,
    total: 22,
  })
  expect(readJson<Array<{ status: string }>>('history')).toEqual([
    expect.objectContaining({ status: 'completed' }),
  ])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    lastRun: { status: 'completed' },
    operationHistory: [{ status: 'completed' }],
  })
})

test('records failed analysis metadata without changing the prior assessment state', async () => {
  const user = userEvent.setup()
  const now = createNow(
    '2026-09-10T11:00:00.000Z',
    '2026-09-10T11:00:01.000Z',
  )
  render(
    <AssessmentProvider delayMs={0} now={now}>
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer analyse' }))

  await waitFor(() => {
    expect(screen.getByTestId('busy')).toHaveTextContent('false')
    expect(
      readJson<{ status: string; message: string; durationMs: number }>(
        'last-run',
      ),
    ).toMatchObject({
      status: 'failed',
      message: 'Finding analysis failed: inventory is required before analysis can run.',
      durationMs: 1000,
    })
  })

  expect(screen.getByTestId('stage')).toHaveTextContent('overview')
  expect(readJson<Array<{ status: string }>>('history')).toEqual([
    expect.objectContaining({ status: 'failed' }),
  ])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    stage: 'overview',
    lastRun: { status: 'failed' },
    operationHistory: [{ status: 'failed' }],
  })
})

test('records operation-specific activity labels in newest-first history order', async () => {
  const user = userEvent.setup()
  const now = createNow(
    '2026-09-10T12:00:00.000Z',
    '2026-09-10T12:00:01.000Z',
    '2026-09-10T12:00:02.000Z',
    '2026-09-10T12:00:03.000Z',
    '2026-09-10T12:00:04.000Z',
    '2026-09-10T12:00:05.000Z',
    '2026-09-10T12:00:06.000Z',
    '2026-09-10T12:00:07.000Z',
    '2026-09-10T12:00:08.000Z',
    '2026-09-10T12:00:09.000Z',
    '2026-09-10T12:00:10.000Z',
    '2026-09-10T12:00:11.000Z',
    '2026-09-10T12:00:12.000Z',
    '2026-09-10T12:00:13.000Z',
    '2026-09-10T12:00:14.000Z',
  )
  render(
    <AssessmentProvider delayMs={0} now={now}>
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer inventaire' }))
  await waitForStage('inventory')
  await user.click(screen.getByRole('button', { name: 'lancer analyse' }))
  await waitForStage('audit')
  await user.click(screen.getByRole('button', { name: 'appliquer F-001' }))
  await waitForStage('remediation')
  await user.click(
    screen.getByRole('button', { name: 'contrÃ´ler V-FILE-EDITOR' }),
  )
  await waitForStage('validation')
  await user.click(screen.getByRole('button', { name: 'lancer campagne' }))
  await waitFor(() => {
    expect(readJson<{ message: string }>('last-run')).toMatchObject({
      message: 'Control campaign completed \u00b7 target verification pending',
    })
  })

  expect(readJson<Array<{ kind: string; message: string }>>('history')).toEqual([
    expect.objectContaining({
      kind: 'controls',
      message: 'Control campaign completed \u00b7 target verification pending',
    }),
    expect.objectContaining({
      kind: 'controls',
      message: 'Hardening check completed \u00b7 V-FILE-EDITOR',
    }),
    expect.objectContaining({
      kind: 'change-set',
      message: 'Change set applied \u00b7 F-001',
    }),
    expect.objectContaining({
      kind: 'analysis',
      message: 'Finding analysis completed \u00b7 10 findings',
    }),
    expect.objectContaining({
      kind: 'discovery',
      message: 'Discovery run completed \u00b7 17 components indexed',
    }),
  ])
  expect(
    readJson<Array<{ label: string }>>('timeline').map((event) => event.label),
  ).toEqual(
    expect.arrayContaining([
      'Discovery run completed \u00b7 17 components indexed',
      'Finding analysis completed \u00b7 10 findings',
      'Change set applied \u00b7 F-001',
      'Hardening check completed \u00b7 V-FILE-EDITOR',
      'Control campaign completed \u00b7 target verification pending',
    ]),
  )
})

test('keeps the later equal-time operation first after persistence is restored', async () => {
  const user = userEvent.setup()
  const now = () => new Date('2026-09-10T12:30:00.000Z')
  const view = render(
    <AssessmentProvider delayMs={0} now={now}>
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer analyse' }))
  await waitFor(() => {
    expect(readJson<{ status: string }>('last-run')).toMatchObject({
      status: 'failed',
    })
  })
  await user.click(screen.getByRole('button', { name: 'lancer inventaire' }))
  await waitForStage('inventory')

  expect(readJson<Array<{ kind: string }>>('history').map((run) => run.kind)).toEqual([
    'discovery',
    'analysis',
  ])

  view.unmount()
  render(
    <AssessmentProvider delayMs={0} now={now}>
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  expect(readJson<Array<{ kind: string }>>('history').map((run) => run.kind)).toEqual([
    'discovery',
    'analysis',
  ])
})

test('persists guided start, navigation, and exit without retaining operation activity', async () => {
  const user = userEvent.setup()
  render(
    <AssessmentProvider
      delayMs={0}
      now={() => new Date('2026-09-10T12:45:00.000Z')}
    >
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer inventaire' }))
  await waitForStage('inventory')
  await user.click(screen.getByRole('button', { name: 'start guided' }))

  expect(screen.getByTestId('guided-step')).toHaveTextContent('0')
  expect(screen.getByTestId('active-operation')).toHaveTextContent('idle')
  expect(screen.getByTestId('progress')).toHaveTextContent('idle')
  expect(screen.getByTestId('last-run')).toHaveTextContent('none')
  expect(readJson<unknown[]>('history')).toEqual([])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    guidedStep: 0,
    lastRun: null,
    operationHistory: [],
  })

  await user.click(screen.getByRole('button', { name: 'next guided' }))
  await user.click(screen.getByRole('button', { name: 'next guided' }))
  await user.click(screen.getByRole('button', { name: 'previous guided' }))

  expect(screen.getByTestId('guided-step')).toHaveTextContent('1')
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    guidedStep: 1,
    operationHistory: [],
  })

  await user.click(screen.getByRole('button', { name: 'exit guided' }))

  expect(screen.getByTestId('guided-step')).toHaveTextContent('none')
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
    guidedStep: null,
    operationHistory: [],
  })

  await user.click(screen.getByRole('button', { name: 'reset' }))

  expect(screen.getByTestId('active-operation')).toHaveTextContent('idle')
  expect(screen.getByTestId('progress')).toHaveTextContent('idle')
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('reset clears transient and persisted activity', async () => {
  const user = userEvent.setup()
  render(
    <AssessmentProvider
      delayMs={0}
      now={() => new Date('2026-09-10T13:00:00.000Z')}
    >
      <AssessmentProbe />
    </AssessmentProvider>,
  )

  await user.click(screen.getByRole('button', { name: 'lancer inventaire' }))
  await waitForStage('inventory')
  await user.click(screen.getByRole('button', { name: 'reset' }))

  expect(screen.getByTestId('stage')).toHaveTextContent('overview')
  expect(screen.getByTestId('progress')).toHaveTextContent('idle')
  expect(screen.getByTestId('active-operation')).toHaveTextContent('idle')
  expect(screen.getByTestId('last-run')).toHaveTextContent('none')
  expect(readJson<unknown[]>('history')).toEqual([])
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
})
