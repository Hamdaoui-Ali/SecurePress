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
  runInventory(): Promise<void>
  runStaticAudit(): Promise<void>
  applyRemediation(findingId: Finding['id']): Promise<void>
  runHardeningCheck(controlId: string): Promise<void>
  runValidation(): Promise<void>
  resetDemo(): void
}

interface AssessmentProviderProps {
  delayMs?: number
  now?: () => Date
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

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
  const stateRef = useRef(state)
  const busyRef = useRef(false)
  const engineRef = useRef<SimulationEngine | null>(null)

  stateRef.current = state

  if (engineRef.current === null) {
    engineRef.current = createSimulationEngine({
      delayMs,
      now,
      onProgress: setProgress,
    })
  }

  const transition = useCallback(
    async (
      operation: (current: AssessmentState) => Promise<AssessmentState>,
    ) => {
      if (busyRef.current) return

      busyRef.current = true
      setBusy(true)
      setProgress(null)

      try {
        const nextState = await operation(stateRef.current)
        stateRef.current = nextState
        setState(nextState)
        saveAssessment(nextState)
      } finally {
        busyRef.current = false
        setBusy(false)
      }
    },
    [],
  )

  const runInventory = useCallback(
    () => transition((current) => engineRef.current!.runInventory(current)),
    [transition],
  )

  const runStaticAudit = useCallback(
    () => transition((current) => engineRef.current!.runStaticAudit(current)),
    [transition],
  )

  const applyRemediation = useCallback(
    (findingId: Finding['id']) =>
      transition((current) =>
        engineRef.current!.applyRemediation(current, findingId),
      ),
    [transition],
  )

  const runHardeningCheck = useCallback(
    (controlId: string) =>
      transition((current) =>
        engineRef.current!.runHardeningCheck(current, controlId),
      ),
    [transition],
  )

  const runValidation = useCallback(
    () => transition((current) => engineRef.current!.runValidation(current)),
    [transition],
  )

  const resetDemo = useCallback(() => {
    const nextState = createInitialAssessment()
    stateRef.current = nextState
    setState(nextState)
    setProgress(null)
    clearAssessment()
  }, [])

  const value = useMemo<AssessmentContextValue>(
    () => ({
      state,
      busy,
      progress,
      runInventory,
      runStaticAudit,
      applyRemediation,
      runHardeningCheck,
      runValidation,
      resetDemo,
    }),
    [
      state,
      busy,
      progress,
      runInventory,
      runStaticAudit,
      applyRemediation,
      runHardeningCheck,
      runValidation,
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
