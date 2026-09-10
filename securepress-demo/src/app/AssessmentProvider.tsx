import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  createInitialAssessment,
  type AssessmentState,
  type Finding,
  type OperationKind,
  type OperationRun,
} from '../domain/models'
import {
  clearAssessment,
  loadAssessment,
  saveAssessment,
} from '../services/storage'
import {
  createSimulationEngine,
  type ProgressUpdate,
  type SimulationEngine,
} from '../services/simulation-engine'

export interface AssessmentContextValue {
  state: AssessmentState
  busy: boolean
  progress: ProgressUpdate | null
  activeOperation: OperationRun | null
  lastRun: OperationRun | null
  operationHistory: OperationRun[]
  runInventory(): Promise<void>
  runStaticAudit(): Promise<void>
  applyRemediation(findingId: Finding['id']): Promise<void>
  runHardeningCheck(controlId: string): Promise<void>
  runValidation(): Promise<void>
  startGuidedDemo(): void
  nextGuidedStep(): void
  previousGuidedStep(): void
  exitGuidedDemo(): void
  resetDemo(): void
}

interface AssessmentProviderProps {
  delayMs?: number
  now?: () => Date
}

interface OperationDefinition {
  kind: OperationKind
  runningMessage: string
  failurePrefix: string
  getCompletedMessage: (state: AssessmentState) => string
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

function formatOperationFailure(error: unknown): string {
  const code = error instanceof Error ? error.message : ''

  switch (code) {
    case 'INVENTORY_REQUIRED':
      return 'inventory is required before analysis can run.'
    case 'AUDIT_REQUIRED':
      return 'finding analysis is required before this operation can run.'
    case 'FINDING_NOT_FOUND':
      return 'the requested finding could not be found.'
    case 'HARDENING_CONTROL_REQUIRED':
      return 'a hardening control is required.'
    case 'HARDENING_CONTROL_NOT_FOUND':
      return 'the requested hardening control could not be found.'
    default:
      return 'an unexpected operation error occurred.'
  }
}

function newestFirstHistory(
  operation: OperationRun,
  history: OperationRun[],
): OperationRun[] {
  return [operation, ...history]
    .filter(
      (run) => run.status === 'completed' || run.status === 'failed',
    )
    .sort(
      (left, right) =>
        Date.parse(right.startedAt) - Date.parse(left.startedAt) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, 20)
}

export function AssessmentProvider({
  children,
  delayMs = 120,
  now = () => new Date(),
}: PropsWithChildren<AssessmentProviderProps>) {
  const [state, setState] = useState<AssessmentState>(() => {
    return loadAssessment().state
  })
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [activeOperation, setActiveOperation] = useState<OperationRun | null>(
    null,
  )
  const stateRef = useRef(state)
  const busyRef = useRef(false)
  const activeOperationRef = useRef<OperationRun | null>(null)
  const progressRef = useRef<ProgressUpdate | null>(null)
  const operationSequenceRef = useRef(0)
  const engineRef = useRef<SimulationEngine | null>(null)

  stateRef.current = state

  if (engineRef.current === null) {
    engineRef.current = createSimulationEngine({
      delayMs,
      now,
      onProgress: (update) => {
        progressRef.current = update
        setProgress(update)

        const currentOperation = activeOperationRef.current
        if (currentOperation === null) return

        const nextOperation = {
          ...currentOperation,
          currentStep: update.step,
          processed: update.processed,
          total: update.total,
        }
        activeOperationRef.current = nextOperation
        setActiveOperation(nextOperation)
      },
    })
  }

  const commitState = useCallback(
    (
      nextState: AssessmentState,
      options: { clearFirst?: boolean; persist?: boolean } = {},
    ) => {
      if (options.clearFirst) clearAssessment()
      stateRef.current = nextState
      setState(nextState)
      if (options.persist !== false) saveAssessment(nextState)
    },
    [],
  )

  const runOperation = useCallback(
    async (
      definition: OperationDefinition,
      operation: (current: AssessmentState) => Promise<AssessmentState>,
    ) => {
      if (busyRef.current) return

      const startedAt = now().toISOString()
      operationSequenceRef.current += 1
      const runningOperation: OperationRun = {
        id: `${definition.kind}-${startedAt}-${operationSequenceRef.current}`,
        kind: definition.kind,
        status: 'running',
        startedAt,
        message: definition.runningMessage,
      }

      busyRef.current = true
      setBusy(true)
      activeOperationRef.current = runningOperation
      setActiveOperation(runningOperation)
      progressRef.current = null
      setProgress(null)
      const getLatestProgress = (): ProgressUpdate | null => progressRef.current

      try {
        const nextState = await operation(stateRef.current)
        const completedAt = now().toISOString()
        const latestProgress = getLatestProgress()
        const completedOperation: OperationRun = {
          ...runningOperation,
          status: 'completed',
          completedAt,
          durationMs: Date.parse(completedAt) - Date.parse(startedAt),
          message: definition.getCompletedMessage(nextState),
          currentStep: latestProgress?.step,
          processed: latestProgress?.processed,
          total: latestProgress?.total,
        }
        const completedState: AssessmentState = {
          ...nextState,
          lastRun: completedOperation,
          operationHistory: newestFirstHistory(
            completedOperation,
            nextState.operationHistory,
          ),
          timeline: [
            ...nextState.timeline,
            {
              id: `${completedOperation.id}-activity`,
              timestamp: completedAt,
              label: completedOperation.message,
            },
          ],
        }
        commitState(completedState)
      } catch (error) {
        const completedAt = now().toISOString()
        const latestProgress = getLatestProgress()
        const failedOperation: OperationRun = {
          ...runningOperation,
          status: 'failed',
          completedAt,
          durationMs: Date.parse(completedAt) - Date.parse(startedAt),
          message: `${definition.failurePrefix}: ${formatOperationFailure(error)}`,
          currentStep: latestProgress?.step,
          processed: latestProgress?.processed,
          total: latestProgress?.total,
        }
        commitState({
          ...stateRef.current,
          lastRun: failedOperation,
          operationHistory: newestFirstHistory(
            failedOperation,
            stateRef.current.operationHistory,
          ),
        })
      } finally {
        busyRef.current = false
        setBusy(false)
        activeOperationRef.current = null
        setActiveOperation(null)
      }
    },
    [commitState, now],
  )

  const runInventory = useCallback(
    () =>
      runOperation(
        {
          kind: 'discovery',
          runningMessage: 'Discovery run in progress',
          failurePrefix: 'Discovery run failed',
          getCompletedMessage: () =>
            'Discovery run completed \u00b7 17 components indexed',
        },
        (current) => engineRef.current!.runInventory(current),
      ),
    [runOperation],
  )

  const runStaticAudit = useCallback(
    () =>
      runOperation(
        {
          kind: 'analysis',
          runningMessage: 'Finding analysis in progress',
          failurePrefix: 'Finding analysis failed',
          getCompletedMessage: (nextState) =>
            `Finding analysis completed \u00b7 ${nextState.visibleFindingIds.length} findings`,
        },
        (current) => engineRef.current!.runStaticAudit(current),
      ),
    [runOperation],
  )

  const applyRemediation = useCallback(
    (findingId: Finding['id']) =>
      runOperation(
        {
          kind: 'change-set',
          runningMessage: `Change set in progress \u00b7 ${findingId}`,
          failurePrefix: 'Change set failed',
          getCompletedMessage: () => `Change set applied \u00b7 ${findingId}`,
        },
        (current) => engineRef.current!.applyRemediation(current, findingId),
      ),
    [runOperation],
  )

  const runHardeningCheck = useCallback(
    (controlId: string) =>
      runOperation(
        {
          kind: 'controls',
          runningMessage: `Hardening check in progress \u00b7 ${controlId}`,
          failurePrefix: 'Hardening check failed',
          getCompletedMessage: () =>
            `Hardening check completed \u00b7 ${controlId}`,
        },
        (current) => engineRef.current!.runHardeningCheck(current, controlId),
      ),
    [runOperation],
  )

  const runValidation = useCallback(
    () =>
      runOperation(
        {
          kind: 'controls',
          runningMessage: 'Control campaign in progress',
          failurePrefix: 'Control campaign failed',
          getCompletedMessage: () =>
            'Control campaign completed \u00b7 target verification pending',
        },
        (current) => engineRef.current!.runValidation(current),
      ),
    [runOperation],
  )

  const startGuidedDemo = useCallback(() => {
    if (busyRef.current) return

    const nextState = {
      ...createInitialAssessment(),
      guidedStep: 0,
    }
    activeOperationRef.current = null
    setActiveOperation(null)
    progressRef.current = null
    setProgress(null)
    commitState(nextState, { clearFirst: true })
  }, [commitState])

  const nextGuidedStep = useCallback(() => {
    const currentStep = stateRef.current.guidedStep
    if (currentStep === null) return

    const nextState = {
      ...stateRef.current,
      guidedStep: Math.min(7, currentStep + 1),
    }
    commitState(nextState)
  }, [commitState])

  const previousGuidedStep = useCallback(() => {
    const currentStep = stateRef.current.guidedStep
    if (currentStep === null) return

    const nextState = {
      ...stateRef.current,
      guidedStep: Math.max(0, currentStep - 1),
    }
    commitState(nextState)
  }, [commitState])

  const exitGuidedDemo = useCallback(() => {
    if (stateRef.current.guidedStep === null) return

    const nextState = {
      ...stateRef.current,
      guidedStep: null,
    }
    commitState(nextState)
  }, [commitState])

  const resetDemo = useCallback(() => {
    if (busyRef.current) return

    const nextState = createInitialAssessment()
    activeOperationRef.current = null
    setActiveOperation(null)
    progressRef.current = null
    setProgress(null)
    commitState(nextState, { clearFirst: true, persist: false })
  }, [commitState])

  const value = useMemo<AssessmentContextValue>(
    () => ({
      state,
      busy,
      progress,
      activeOperation,
      lastRun: state.lastRun,
      operationHistory: state.operationHistory,
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
    }),
    [
      state,
      busy,
      progress,
      activeOperation,
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
    ],
  )

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider')
  }
  return context
}
