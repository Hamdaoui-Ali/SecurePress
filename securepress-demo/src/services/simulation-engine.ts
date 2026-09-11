import { telcoScenario } from '../data/scenario'
import {
  createInitialAssessment,
  type AssessmentState,
  type Finding,
  type ValidationStatus,
} from '../domain/models'

export interface ProgressUpdate {
  percent: number
  message: string
  step: string
  processed: number
  total: number
}

export interface SimulationOptions {
  delayMs: number
  now: () => Date
  onProgress?: (update: ProgressUpdate) => void
}

export interface SimulationEngine {
  runInventory(state: AssessmentState): Promise<AssessmentState>
  runStaticAudit(state: AssessmentState): Promise<AssessmentState>
  applyRemediation(
    state: AssessmentState,
    findingId: Finding['id'],
  ): Promise<AssessmentState>
  runHardeningCheck(
    state: AssessmentState,
    controlId: string,
  ): Promise<AssessmentState>
  runValidation(state: AssessmentState): Promise<AssessmentState>
  resetDemo(): AssessmentState
}

const EXTERNAL_RETEST_ID = 'external-dynamic-retest'

interface ProgressPhase {
  step: string
  processed: number
  total: number
}

function sleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) return Promise.resolve()
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

function createProgressUpdate(
  phase: ProgressPhase,
  index: number,
  phaseCount: number,
): ProgressUpdate {
  return {
    percent: Math.round((index / (phaseCount - 1)) * 100),
    message: phase.step,
    step: phase.step,
    processed: phase.processed,
    total: phase.total,
  }
}

async function runPhases<T>(
  phases: ProgressPhase[],
  delayMs: number,
  onProgress: (update: ProgressUpdate) => void,
  complete: () => T,
): Promise<T> {
  for (const [index, phase] of phases.entries()) {
    if (index === phases.length - 1) {
      const result = complete()
      onProgress(createProgressUpdate(phase, index, phases.length))
      return result
    }

    onProgress(createProgressUpdate(phase, index, phases.length))
    await sleep(delayMs)
  }

  throw new Error('PHASES_REQUIRED')
}

export function createSimulationEngine(
  options: SimulationOptions,
): SimulationEngine {
  const delayMs = Math.max(0, options.delayMs)
  const onProgress = options.onProgress ?? (() => undefined)

  async function runInventory(state: AssessmentState): Promise<AssessmentState> {
    const componentTotal = telcoScenario.inventory.components.length

    return runPhases(
      [
        {
          step: 'Preparing source package',
          processed: 0,
          total: componentTotal,
        },
        ...telcoScenario.inventory.components.map((component, index) => ({
          step: `Indexing ${component.name}`,
          processed: index + 1,
          total: componentTotal,
        })),
        {
          step: 'Source inventory ready',
          processed: componentTotal,
          total: componentTotal,
        },
      ],
      delayMs,
      onProgress,
      () => ({
        ...state,
        stage: 'inventory',
        inventoryCompleted: true,
      }),
    )
  }

  async function runStaticAudit(
    state: AssessmentState,
  ): Promise<AssessmentState> {
    if (!state.inventoryCompleted) throw new Error('INVENTORY_REQUIRED')

    const findingTotal = telcoScenario.findings.length
    return runPhases(
      [
        { step: 'Preparing finding analysis', processed: 0, total: findingTotal },
        ...telcoScenario.findings.map((finding, index) => ({
          step: `Qualifying ${finding.id}`,
          processed: index + 1,
          total: findingTotal,
        })),
        {
          step: 'Finding analysis ready',
          processed: findingTotal,
          total: findingTotal,
        },
      ],
      delayMs,
      onProgress,
      () => ({
        ...state,
        stage: 'audit',
        auditCompleted: true,
        visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
      }),
    )
  }

  async function applyRemediation(
    state: AssessmentState,
    findingId: Finding['id'],
  ): Promise<AssessmentState> {
    if (!state.auditCompleted) throw new Error('AUDIT_REQUIRED')

    const finding = telcoScenario.findings.find((item) => item.id === findingId)
    if (!finding) throw new Error('FINDING_NOT_FOUND')
    if (state.appliedFindingIds.includes(findingId)) return state

    const dependencyTotal = finding.validationIds.length

    return runPhases(
      [
        {
          step: 'Préparation du change set',
          processed: 0,
          total: dependencyTotal,
        },
        {
          step: 'Vérification des dépendances',
          processed: dependencyTotal,
          total: dependencyTotal,
        },
        {
          step: 'Enregistrement des changements',
          processed: dependencyTotal,
          total: dependencyTotal,
        },
        {
          step: 'Finalisation du change set',
          processed: dependencyTotal,
          total: dependencyTotal,
        },
      ],
      delayMs,
      onProgress,
      () => ({
        ...state,
        stage: 'remediation',
        appliedFindingIds: [...state.appliedFindingIds, findingId],
      }),
    )
  }

  async function runHardeningCheck(
    state: AssessmentState,
    controlId: string,
  ): Promise<AssessmentState> {
    if (!state.auditCompleted) throw new Error('AUDIT_REQUIRED')
    if (!controlId.trim()) throw new Error('HARDENING_CONTROL_REQUIRED')

    const hardeningControls = telcoScenario.validationChecks.filter(
      (check) => check.category === 'hardening',
    )
    const control = hardeningControls.find((check) => check.id === controlId)
    if (!control) throw new Error('HARDENING_CONTROL_NOT_FOUND')
    if (state.completedHardeningCheckIds.includes(control.id)) return state

    const controlTotal = hardeningControls.length
    const completedControlCount = state.completedHardeningCheckIds.filter(
      (completedControlId) =>
        hardeningControls.some((check) => check.id === completedControlId),
    ).length
    const processedControlCount = Math.min(
      controlTotal,
      completedControlCount + 1,
    )

    return runPhases(
      [
        {
          step: 'Initialisation de la campagne de contrôles',
          processed: 0,
          total: controlTotal,
        },
        {
          step: 'Contrôles de durcissement',
          processed: processedControlCount,
          total: controlTotal,
        },
        {
          step: 'Clôture de la campagne',
          processed: processedControlCount,
          total: controlTotal,
        },
      ],
      delayMs,
      onProgress,
      () => ({
        ...state,
        stage: 'validation',
        completedHardeningCheckIds: [
          ...state.completedHardeningCheckIds,
          control.id,
        ],
        validationResults: {
          ...state.validationResults,
          [control.id]: control.initialStatus === 'target_validation_required'
            ? 'target_validation_required'
            : 'simulated_pass',
        },
      }),
    )
  }

  async function runValidation(
    state: AssessmentState,
  ): Promise<AssessmentState> {
    if (!state.auditCompleted) throw new Error('AUDIT_REQUIRED')

    const validationTotal = telcoScenario.validationChecks.length
    const functionalCount = telcoScenario.validationChecks.filter(
      (check) => check.category === 'functional',
    ).length
    const hardeningCount = telcoScenario.validationChecks.filter(
      (check) => check.category === 'hardening',
    ).length
    const integrityCount = telcoScenario.validationChecks.filter(
      (check) => check.category === 'integrity',
    ).length

    return runPhases(
      [
        {
          step: 'Initialisation de la campagne de contrôles',
          processed: 0,
          total: validationTotal,
        },
        {
          step: 'Contrôles fonctionnels',
          processed: functionalCount,
          total: validationTotal,
        },
        {
          step: 'Contrôles de durcissement',
          processed: functionalCount + hardeningCount,
          total: validationTotal,
        },
        {
          step: 'Contrôles d’intégrité',
          processed: functionalCount + hardeningCount + integrityCount,
          total: validationTotal,
        },
        {
          step: 'Clôture de la campagne',
          processed: validationTotal,
          total: validationTotal,
        },
      ],
      delayMs,
      onProgress,
      () => {
        const results: Record<string, ValidationStatus> = Object.fromEntries(
          telcoScenario.validationChecks.map((check) => [
            check.id,
            check.initialStatus === 'target_validation_required'
              ? 'target_validation_required'
              : 'simulated_pass',
          ]),
        )

        results[EXTERNAL_RETEST_ID] = 'dynamic_retest_not_executed'

        return {
          ...state,
          stage: 'validation',
          validationResults: {
            ...state.validationResults,
            ...results,
          },
        }
      },
    )
  }

  return {
    runInventory,
    runStaticAudit,
    applyRemediation,
    runHardeningCheck,
    runValidation,
    resetDemo: createInitialAssessment,
  }
}
