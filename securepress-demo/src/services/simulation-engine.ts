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

function countComponents(type: 'core' | 'theme' | 'plugin'): number {
  return telcoScenario.inventory.components.filter(
    (component) => component.type === type,
  ).length
}

function appendTimelineEvent(
  state: AssessmentState,
  now: () => Date,
  id: string,
  label: string,
): AssessmentState {
  return {
    ...state,
    timeline: [
      ...state.timeline,
      {
        id: `${id}-${state.timeline.length + 1}`,
        timestamp: now().toISOString(),
        label,
      },
    ],
  }
}

export function createSimulationEngine(
  options: SimulationOptions,
): SimulationEngine {
  const delayMs = Math.max(0, options.delayMs)
  const onProgress = options.onProgress ?? (() => undefined)

  async function runInventory(state: AssessmentState): Promise<AssessmentState> {
    if (state.inventoryCompleted) return state

    const coreCount = countComponents('core')
    const themeCount = countComponents('theme')
    const componentTotal = telcoScenario.inventory.components.length

    return runPhases(
      [
        { step: 'Lecture du package TELCO', processed: 0, total: componentTotal },
        {
          step: 'Indexation du noyau WordPress',
          processed: coreCount,
          total: componentTotal,
        },
        {
          step: 'Inventaire des thèmes',
          processed: coreCount + themeCount,
          total: componentTotal,
        },
        {
          step: 'Inventaire des extensions',
          processed: componentTotal,
          total: componentTotal,
        },
        {
          step: 'Contrôle de la configuration',
          processed: componentTotal,
          total: componentTotal,
        },
        {
          step: 'Synthèse des composants',
          processed: componentTotal,
          total: componentTotal,
        },
      ],
      delayMs,
      onProgress,
      () =>
        appendTimelineEvent(
          {
            ...state,
            stage: 'inventory',
            inventoryCompleted: true,
          },
          options.now,
          'inventory',
          'Inventaire simulé terminé',
        ),
    )
  }

  async function runStaticAudit(
    state: AssessmentState,
  ): Promise<AssessmentState> {
    if (state.auditCompleted) return state
    if (!state.inventoryCompleted) throw new Error('INVENTORY_REQUIRED')

    const findingTotal = telcoScenario.findings.length
    const observedEvidenceCount = telcoScenario.findings.filter(
      (finding) => finding.evidenceStatus === 'observed_in_snapshot',
    ).length
    const correlatedFindingCount = telcoScenario.findings.filter((finding) =>
      telcoScenario.remediations.some(
        (remediation) => remediation.findingId === finding.id,
      ),
    ).length

    return runPhases(
      [
        { step: 'Chargement des constats', processed: 0, total: findingTotal },
        {
          step: 'Analyse des preuves',
          processed: observedEvidenceCount,
          total: findingTotal,
        },
        {
          step: 'Corrélation risque/remédiation',
          processed: correlatedFindingCount,
          total: findingTotal,
        },
        {
          step: 'Finalisation de l’analyse',
          processed: findingTotal,
          total: findingTotal,
        },
      ],
      delayMs,
      onProgress,
      () =>
        appendTimelineEvent(
          {
            ...state,
            stage: 'audit',
            auditCompleted: true,
            visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
          },
          options.now,
          'static-audit',
          `Audit statique simulé terminé : ${findingTotal} constats qualifiés`,
        ),
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
      () =>
        appendTimelineEvent(
          {
            ...state,
            stage: 'remediation',
            appliedFindingIds: [...state.appliedFindingIds, findingId],
          },
          options.now,
          `remediation-${findingId}`,
          `Remédiation simulée appliquée : ${findingId}`,
        ),
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
      () =>
        appendTimelineEvent(
          {
            ...state,
            stage: 'validation',
            completedHardeningCheckIds: [
              ...state.completedHardeningCheckIds,
              control.id,
            ],
          },
          options.now,
          `hardening-${control.id}`,
          `Contrôle de durcissement simulé : ${control.id}`,
        ),
    )
  }

  async function runValidation(
    state: AssessmentState,
  ): Promise<AssessmentState> {
    if (!state.auditCompleted) throw new Error('AUDIT_REQUIRED')
    if (state.validationResults[EXTERNAL_RETEST_ID]) return state

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

        return appendTimelineEvent(
          {
            ...state,
            stage: 'validation',
            validationResults: {
              ...state.validationResults,
              ...results,
            },
          },
          options.now,
          'validation',
          'Validation simulée terminée ; contre-audit dynamique externe non exécuté',
        )
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
