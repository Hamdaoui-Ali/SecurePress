import { z } from 'zod'

const OPERATION_HISTORY_LIMIT = 20

const IsoDateTimeSchema = z.iso
  .datetime({ offset: true })
  .refine((value) => {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number)
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

    return !Number.isNaN(Date.parse(value)) && day <= daysInMonth
  })

export const OperationKindSchema = z.enum([
  'discovery',
  'analysis',
  'change-set',
  'controls',
])

export const OperationStatusSchema = z.enum([
  'idle',
  'running',
  'completed',
  'failed',
])

export const OperationRunSchema = z.object({
  id: z.string().min(1),
  kind: OperationKindSchema,
  status: OperationStatusSchema,
  startedAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.optional(),
  message: z.string().min(1),
  currentStep: z.string().min(1).optional(),
  processed: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
  durationMs: z.number().nonnegative().optional(),
})

const PersistedOperationRunSchema = OperationRunSchema.extend({
  status: z.enum(['completed', 'failed']),
})

const OperationHistorySchema = z
  .array(z.unknown())
  .catch([])
  .transform((entries) =>
    entries
      .flatMap((entry) => {
        const parsed = PersistedOperationRunSchema.safeParse(entry)
        return parsed.success ? [parsed.data] : []
      })
      .sort(
        (left, right) =>
          Date.parse(right.startedAt) - Date.parse(left.startedAt) ||
          left.id.localeCompare(right.id),
      )
      .slice(0, OPERATION_HISTORY_LIMIT),
  )

export const FindingSchema = z.object({
  id: z.string().regex(/^F-\d{3}$/),
  title: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'variable']),
  riskPoints: z.number().int().positive(),
  confidence: z.enum(['high', 'medium', 'low']),
  evidence: z.string().min(1),
  evidenceStatus: z.enum([
    'observed_in_snapshot',
    'documented_in_audit',
    'not_observable_offline',
  ]),
  exposure: z.string().min(1),
  impact: z.string().min(1),
  recommendation: z.string().min(1),
  remediationId: z.string().regex(/^R-\d{3}$/),
  validationIds: z.array(z.string().min(1)).min(1),
  sourceNote: z.string().min(1),
})

export const RemediationSchema = z.object({
  id: z.string().regex(/^R-\d{3}$/),
  findingId: z.string().regex(/^F-\d{3}$/),
  title: z.string().min(1),
  before: z.string().min(1),
  after: z.string().min(1),
  rationale: z.string().min(1),
  artifact: z.string().min(1),
  initialStatus: z.enum([
    'not_started',
    'recommended',
    'prepared',
    'developed',
    'applied_in_simulation',
  ]),
})

export const ValidationCheckSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum([
    'functional',
    'hardening',
    'integrity',
    'regression',
    'retest',
  ]),
  expectedResult: z.string().min(1),
  initialStatus: z.enum([
    'not_run',
    'simulated_pass',
    'simulated_fail',
    'target_validation_required',
    'dynamic_retest_not_executed',
  ]),
})

export const ComponentRecordSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['core', 'theme', 'plugin']),
  version: z.string().nullable(),
  presence: z.literal('confirmed_in_files'),
  activation: z.enum(['confirmed', 'unknown']),
  sourceNote: z.string().min(1),
})

export const AssessmentStateSchema = z.object({
  stage: z.enum([
    'overview',
    'inventory',
    'audit',
    'remediation',
    'validation',
    'report',
  ]),
  inventoryCompleted: z.boolean(),
  auditCompleted: z.boolean(),
  visibleFindingIds: z.array(z.string().regex(/^F-\d{3}$/)),
  appliedFindingIds: z.array(z.string().regex(/^F-\d{3}$/)),
  completedHardeningCheckIds: z.array(z.string()),
  validationResults: z.record(
    z.string(),
    z.enum([
      'not_run',
      'simulated_pass',
      'simulated_fail',
      'target_validation_required',
      'dynamic_retest_not_executed',
    ]),
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      timestamp: z.string(),
      label: z.string(),
    }),
  ),
  guidedStep: z.number().int().min(0).max(7).nullable(),
  lastRun: PersistedOperationRunSchema.nullable().catch(null).default(null),
  operationHistory: OperationHistorySchema.default([]),
})

export const ScenarioSchema = z.object({
  project: z.object({
    id: z.literal('TELCO-AUDIT-2026'),
    name: z.literal('TELCO'),
    wordpressVersion: z.literal('6.4.3'),
  }),
  inventory: z.object({
    pluginCount: z.literal(17),
    themeCount: z.literal(4),
    components: z.array(ComponentRecordSchema),
  }),
  findings: z.array(FindingSchema).length(10),
  remediations: z.array(RemediationSchema).min(10),
  validationChecks: z.array(ValidationCheckSchema).min(10),
})
