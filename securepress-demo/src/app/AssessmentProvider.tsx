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
  type DirectoryHandleLike,
  type AssessmentState,
  type Finding,
  type OperationKind,
  type OperationRun,
  type SourceMode,
  type WorkspaceSource,
} from '../domain/models'
import { telcoScenario } from '../data/scenario'
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
import {
  getPreparedSource,
  inspectSelectedDirectory,
} from '../services/source-adapter'

export const PREPARED_SOURCE_PATH = 'C:\\SecurePress\\targets\\lnet-telco-wordpress'

export interface SourceDraft {
  mode: SourceMode
  pathLabel: string
  directoryHandle: DirectoryHandleLike | null
}

export interface SourceCheckProgress {
  percent: number
  message: string
}

export interface AssessmentContextValue {
  state: AssessmentState
  source: WorkspaceSource
  sourceDraft: SourceDraft | null
  sourceChecking: boolean
  sourceCheckProgress: SourceCheckProgress | null
  busy: boolean
  progress: ProgressUpdate | null
  activeOperation: OperationRun | null
  lastRun: OperationRun | null
  operationHistory: OperationRun[]
  runInventory(): Promise<boolean>
  runStaticAudit(): Promise<boolean>
  applyRemediation(findingId: Finding['id']): Promise<boolean>
  runHardeningCheck(controlId: string): Promise<boolean>
  runValidation(): Promise<boolean>
  startGuidedDemo(): void
  nextGuidedStep(expectedStep?: number): void
  previousGuidedStep(): void
  exitGuidedDemo(): void
  setSourcePath(pathLabel: string): void
  selectLocalFolder(handle: DirectoryHandleLike): void
  usePreparedSource(): void
  verifySelectedSource(): Promise<boolean>
  clearSource(): void
  resetDemo(): void
}

interface AssessmentProviderProps {
  delayMs?: number
  now?: () => Date
}

interface OperationDefinition {
  kind: OperationKind
  findingId?: Finding['id']
  isSatisfied?: (state: AssessmentState) => boolean
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
        Date.parse(right.startedAt) - Date.parse(left.startedAt),
    )
    .slice(0, 20)
}

function pause(delayMs: number): Promise<void> {
  if (delayMs <= 0) return Promise.resolve()
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

export function AssessmentProvider({
  children,
  delayMs = 200,
  now = () => new Date(),
}: PropsWithChildren<AssessmentProviderProps>) {
  const [state, setState] = useState<AssessmentState>(() => {
    return loadAssessment().state
  })
  const [sourceDraft, setSourceDraft] = useState<SourceDraft | null>(null)
  const [sourceChecking, setSourceChecking] = useState(false)
  const [sourceCheckProgress, setSourceCheckProgress] =
    useState<SourceCheckProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [activeOperation, setActiveOperation] = useState<OperationRun | null>(
    null,
  )
  const stateRef = useRef(state)
  const sourceDraftRef = useRef<SourceDraft | null>(sourceDraft)
  const sourceCheckingRef = useRef(false)
  const busyRef = useRef(false)
  const activeOperationRef = useRef<OperationRun | null>(null)
  const progressRef = useRef<ProgressUpdate | null>(null)
  const operationSequenceRef = useRef(0)
  const engineRef = useRef<SimulationEngine | null>(null)

  stateRef.current = state
  sourceDraftRef.current = sourceDraft

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

  const clearTransientOperationState = useCallback(() => {
    activeOperationRef.current = null
    setActiveOperation(null)
    progressRef.current = null
    setProgress(null)
  }, [])

  const commitAssessmentTransition = useCallback(
    (
      nextState: AssessmentState,
      options: {
        clearStoredState?: boolean
        persist?: boolean
        resetTransientOperation?: boolean
      } = {},
    ) => {
      if (options.resetTransientOperation) clearTransientOperationState()
      if (options.clearStoredState) clearAssessment()
      stateRef.current = nextState
      setState(nextState)
      if (options.persist !== false) saveAssessment(nextState)
    },
    [clearTransientOperationState],
  )

  const setSourcePath = useCallback((pathLabel: string) => {
    setSourceDraft({ mode: 'folder', pathLabel, directoryHandle: null })
    setSourceCheckProgress(null)
  }, [])

  const selectLocalFolder = useCallback((handle: DirectoryHandleLike) => {
    setSourceDraft({ mode: 'folder', pathLabel: handle.name, directoryHandle: handle })
    setSourceCheckProgress(null)
  }, [])

  const usePreparedSource = useCallback(() => {
    setSourceDraft({
      mode: 'prepared',
      pathLabel: PREPARED_SOURCE_PATH,
      directoryHandle: null,
    })
    setSourceCheckProgress(null)
  }, [])

  const verifySelectedSource = useCallback(async () => {
    if (busyRef.current || sourceCheckingRef.current) return false

    const draft = sourceDraftRef.current
    if (
      draft === null ||
      draft.pathLabel.trim() === '' ||
      (draft.mode === 'folder' && draft.directoryHandle === null)
    ) {
      setSourceCheckProgress({
        percent: 0,
        message: 'Select a local folder or use the prepared package before verifying.',
      })
      return false
    }

    sourceCheckingRef.current = true
    setSourceChecking(true)
    setSourceCheckProgress({ percent: 10, message: 'Checking local source access' })

    try {
      await pause(delayMs)
      setSourceCheckProgress({ percent: 45, message: 'Reading WordPress source markers' })
      await pause(delayMs)

      const verifiedSource =
        draft.mode === 'prepared'
          ? getPreparedSource(draft.pathLabel, now())
          : await inspectSelectedDirectory(draft.directoryHandle!, draft.pathLabel, now())

      setSourceCheckProgress({
        percent: verifiedSource.status === 'ready' ? 100 : 0,
        message:
          verifiedSource.status === 'ready'
            ? 'Source ready'
            : verifiedSource.message,
      })

      if (verifiedSource.status !== 'ready') {
        commitAssessmentTransition({
          ...stateRef.current,
          source: verifiedSource,
        })
        return false
      }

      commitAssessmentTransition(
        {
          ...createInitialAssessment(),
          source: verifiedSource,
        },
        { resetTransientOperation: true },
      )
      setSourceDraft(null)
      return true
    } catch {
      const failedSource: WorkspaceSource = {
        ...stateRef.current.source,
        status: 'invalid',
        mode: draft.mode,
        pathLabel: draft.pathLabel,
        displayName: draft.pathLabel.split(/[\\/]/).pop() ?? draft.pathLabel,
        message: 'The source could not be inspected in this browser session.',
        verifiedAt: null,
      }
      setSourceCheckProgress({ percent: 0, message: failedSource.message })
      commitAssessmentTransition({
        ...stateRef.current,
        source: failedSource,
      })
      return false
    } finally {
      sourceCheckingRef.current = false
      setSourceChecking(false)
    }
  }, [commitAssessmentTransition, delayMs, now])

  const runOperation = useCallback(
    async (
      definition: OperationDefinition,
      operation: (current: AssessmentState) => Promise<AssessmentState>,
    ) => {
      if (busyRef.current) return false
      if (definition.isSatisfied?.(stateRef.current)) return true

      const startedAt = now().toISOString()
      operationSequenceRef.current += 1
      const runningOperation: OperationRun = {
        id: `${definition.kind}-${startedAt}-${operationSequenceRef.current}`,
        kind: definition.kind,
        findingId: definition.findingId,
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
          // Navigation can change while the engine processes its input snapshot.
          guidedStep: stateRef.current.guidedStep,
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
        commitAssessmentTransition(completedState)
        return true
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
        commitAssessmentTransition({
          ...stateRef.current,
          lastRun: failedOperation,
          operationHistory: newestFirstHistory(
            failedOperation,
            stateRef.current.operationHistory,
          ),
        })
        return false
      } finally {
        busyRef.current = false
        setBusy(false)
        activeOperationRef.current = null
        setActiveOperation(null)
      }
    },
    [commitAssessmentTransition, now],
  )

  const runInventory = useCallback(
    () =>
      runOperation(
        {
          kind: 'discovery',
          runningMessage: 'Discovery run in progress',
          failurePrefix: 'Discovery run failed',
          getCompletedMessage: () =>
            `Discovery run completed \u00b7 ${telcoScenario.inventory.components.length} components indexed`,
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
          findingId,
          isSatisfied: current => current.appliedFindingIds.includes(findingId),
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
          isSatisfied: current => current.completedHardeningCheckIds.includes(controlId),
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
      source: stateRef.current.source,
      guidedStep: 0,
    }
    commitAssessmentTransition(nextState, {
      clearStoredState: true,
      resetTransientOperation: true,
    })
  }, [commitAssessmentTransition])

  const nextGuidedStep = useCallback((expectedStep?: number) => {
    const currentStep = stateRef.current.guidedStep
    if (currentStep === null) return
    if (expectedStep !== undefined && currentStep !== expectedStep) return

    const nextState = {
      ...stateRef.current,
      guidedStep: Math.min(7, currentStep + 1),
    }
    commitAssessmentTransition(nextState)
  }, [commitAssessmentTransition])

  const previousGuidedStep = useCallback(() => {
    const currentStep = stateRef.current.guidedStep
    if (currentStep === null) return

    const nextState = {
      ...stateRef.current,
      guidedStep: Math.max(0, currentStep - 1),
    }
    commitAssessmentTransition(nextState)
  }, [commitAssessmentTransition])

  const exitGuidedDemo = useCallback(() => {
    if (stateRef.current.guidedStep === null) return

    const nextState = {
      ...stateRef.current,
      guidedStep: null,
    }
    commitAssessmentTransition(nextState)
  }, [commitAssessmentTransition])

  const clearSource = useCallback(() => {
    if (busyRef.current) return

    const nextState = createInitialAssessment()
    setSourceDraft(null)
    setSourceCheckProgress(null)
    setSourceChecking(false)
    sourceCheckingRef.current = false
    commitAssessmentTransition(nextState, {
      clearStoredState: true,
      persist: false,
      resetTransientOperation: true,
    })
  }, [commitAssessmentTransition])

  const resetDemo = clearSource

  const value = useMemo<AssessmentContextValue>(
    () => ({
      state,
      source: state.source,
      sourceDraft,
      sourceChecking,
      sourceCheckProgress,
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
      setSourcePath,
      selectLocalFolder,
      usePreparedSource,
      verifySelectedSource,
      clearSource,
      resetDemo,
    }),
    [
      state,
      sourceDraft,
      sourceChecking,
      sourceCheckProgress,
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
      setSourcePath,
      selectLocalFolder,
      usePreparedSource,
      verifySelectedSource,
      clearSource,
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
