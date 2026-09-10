import { AssessmentStateSchema } from '../domain/schema'
import {
  createInitialAssessment,
  type AssessmentState,
} from '../domain/models'

export const STORAGE_KEY = 'securepress.audit-lab.v1'

export type LoadResult =
  | { status: 'restored'; state: AssessmentState }
  | { status: 'initialized'; state: AssessmentState }
  | { status: 'recovered'; state: AssessmentState }

export function loadAssessment(): LoadResult {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === null) {
      return { status: 'initialized', state: createInitialAssessment() }
    }

    const parsed = AssessmentStateSchema.safeParse(JSON.parse(stored))

    if (!parsed.success) {
      return { status: 'recovered', state: createInitialAssessment() }
    }

    // Only file-editor has an equivalent in the canonical TELCO control set.
    // Retired and unknown IDs remain historical records; do not reinterpret them.
    const completedHardeningCheckIds = [...new Set(
      parsed.data.completedHardeningCheckIds.map(id =>
        id === 'file-editor' ? 'V-FILE-EDITOR' : id,
      ),
    )]
    const validationResults = { ...parsed.data.validationResults }
    if (completedHardeningCheckIds.includes('V-FILE-EDITOR')) {
      validationResults['V-FILE-EDITOR'] ??= 'simulated_pass'
    }
    if (completedHardeningCheckIds.includes('V-XMLRPC-TARGET')) {
      validationResults['V-XMLRPC-TARGET'] = 'target_validation_required'
    }

    return {
      status: 'restored',
      state: { ...parsed.data, completedHardeningCheckIds, validationResults } as AssessmentState,
    }
  } catch {
    return { status: 'recovered', state: createInitialAssessment() }
  }
}

export function saveAssessment(state: AssessmentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearAssessment(): void {
  localStorage.removeItem(STORAGE_KEY)
}
