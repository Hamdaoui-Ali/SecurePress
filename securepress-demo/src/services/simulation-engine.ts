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

const inventoryProgress: ProgressUpdate[] = [
  { percent: 15, message: 'Lecture de l’instantané simulé' },
  { percent: 30, message: 'Détection du noyau WordPress' },
  { percent: 45, message: 'Inspection des thèmes' },
  { percent: 60, message: 'Inspection des extensions' },
  { percent: 75, message: 'Inspection de la configuration' },
  { percent: 100, message: 'Construction de l’inventaire' },
]

function sleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) return Promise.resolve()
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
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

    for (const update of inventoryProgress) {
      onProgress(update)
      await sleep(delayMs)
    }

    return appendTimelineEvent(
      {
        ...state,
        stage: 'inventory',
        inventoryCompleted: true,
      },
      options.now,
      'inventory',
      'Inventaire simulé terminé',
    )
  }

  async function runStaticAudit(
    state: AssessmentState,
  ): Promise<AssessmentState> {
    if (state.auditCompleted) return state
    if (!state.inventoryCompleted) throw new Error('INVENTORY_REQUIRED')

    onProgress({ percent: 50, message: 'Lecture des preuves locales' })
    await sleep(delayMs)
    onProgress({ percent: 100, message: 'Audit statique simulé terminé' })

    return appendTimelineEvent(
      {
        ...state,
        stage: 'audit',
        auditCompleted: true,
        visibleFindingIds: telcoScenario.findings.map((finding) => finding.id),
      },
      options.now,
      'static-audit',
      'Audit statique simulé terminé : 10 constats qualifiés',
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

    await sleep(delayMs)

    return appendTimelineEvent(
      {
        ...state,
        stage: 'remediation',
        appliedFindingIds: [...state.appliedFindingIds, findingId],
      },
      options.now,
      `remediation-${findingId}`,
      `Remédiation simulée appliquée : ${findingId}`,
    )
  }

  async function runHardeningCheck(
    state: AssessmentState,
    controlId: string,
  ): Promise<AssessmentState> {
    if (!state.auditCompleted) throw new Error('AUDIT_REQUIRED')
    if (!controlId.trim()) throw new Error('HARDENING_CONTROL_REQUIRED')
    if (state.completedHardeningCheckIds.includes(controlId)) return state

    await sleep(delayMs)

    return appendTimelineEvent(
      {
        ...state,
        stage: 'validation',
        completedHardeningCheckIds: [
          ...state.completedHardeningCheckIds,
          controlId,
        ],
      },
      options.now,
      `hardening-${controlId}`,
      `Contrôle de durcissement simulé : ${controlId}`,
    )
  }

  async function runValidation(
    state: AssessmentState,
  ): Promise<AssessmentState> {
    if (!state.auditCompleted) throw new Error('AUDIT_REQUIRED')
    if (state.validationResults[EXTERNAL_RETEST_ID]) return state

    onProgress({ percent: 30, message: 'Préparation des validations simulées' })
    await sleep(delayMs)
    onProgress({ percent: 100, message: 'Validation simulée terminée' })

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
