export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'variable'

export type Confidence = 'high' | 'medium' | 'low'

export type EvidenceStatus =
  | 'observed_in_snapshot'
  | 'documented_in_audit'
  | 'not_observable_offline'

export type RemediationStatus =
  | 'not_started'
  | 'recommended'
  | 'prepared'
  | 'developed'
  | 'applied_in_simulation'

export type ValidationStatus =
  | 'not_run'
  | 'simulated_pass'
  | 'simulated_fail'
  | 'target_validation_required'
  | 'dynamic_retest_not_executed'

export type WorkflowStage =
  | 'overview'
  | 'inventory'
  | 'audit'
  | 'remediation'
  | 'validation'
  | 'report'

export type OperationKind =
  | 'discovery'
  | 'analysis'
  | 'change-set'
  | 'controls'

export type OperationStatus = 'idle' | 'running' | 'completed' | 'failed'

export interface OperationRun {
  id: string
  findingId?: Finding['id']
  kind: OperationKind
  status: OperationStatus
  startedAt: string
  completedAt?: string
  message: string
  currentStep?: string
  processed?: number
  total?: number
  durationMs?: number
}

export interface Finding {
  id: `F-${string}`
  title: string
  severity: Severity
  riskPoints: number
  confidence: Confidence
  evidence: string
  evidenceStatus: EvidenceStatus
  exposure: string
  impact: string
  recommendation: string
  remediationId: string
  validationIds: string[]
  sourceNote: string
}

export interface ComponentRecord {
  id: string
  name: string
  type: 'core' | 'theme' | 'plugin'
  version: string | null
  presence: 'confirmed_in_files'
  activation: 'confirmed' | 'unknown'
  sourceNote: string
}

export interface Remediation {
  id: string
  findingId: Finding['id']
  title: string
  before: string
  after: string
  rationale: string
  artifact: string
  initialStatus: RemediationStatus
}

export interface ValidationCheck {
  id: string
  title: string
  category: 'functional' | 'hardening' | 'integrity' | 'regression' | 'retest'
  expectedResult: string
  initialStatus: ValidationStatus
}

export interface ProjectRecord {
  id: 'TELCO-AUDIT-2026'
  name: 'LNET TELCO'
  wordpressVersion: '6.4.3'
}

export interface Scenario {
  project: ProjectRecord
  inventory: {
    pluginCount: 17
    themeCount: 4
    components: ComponentRecord[]
  }
  findings: Finding[]
  remediations: Remediation[]
  validationChecks: ValidationCheck[]
}

export interface TimelineEvent {
  id: string
  timestamp: string
  label: string
}

export interface AssessmentState {
  stage: WorkflowStage
  inventoryCompleted: boolean
  auditCompleted: boolean
  visibleFindingIds: Finding['id'][]
  appliedFindingIds: Finding['id'][]
  completedHardeningCheckIds: string[]
  validationResults: Record<string, ValidationStatus>
  timeline: TimelineEvent[]
  guidedStep: number | null
  lastRun: OperationRun | null
  operationHistory: OperationRun[]
}

export function createInitialAssessment(): AssessmentState {
  return {
    stage: 'overview',
    inventoryCompleted: false,
    auditCompleted: false,
    visibleFindingIds: [],
    appliedFindingIds: [],
    completedHardeningCheckIds: [],
    validationResults: {},
    timeline: [],
    guidedStep: null,
    lastRun: null,
    operationHistory: [],
  }
}
