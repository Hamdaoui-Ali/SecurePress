export const guidedSteps = [
  'overview',
  'run-inventory',
  'run-audit',
  'open-f001',
  'apply-remediation',
  'run-validation',
  'review-comparison',
  'finish-report',
] as const

export type GuidedStep = (typeof guidedSteps)[number]

export interface GuidedStepDetail {
  route: string
  targetId: string
  title: string
  description: string
}

export const guidedStepDetails: Record<GuidedStep, GuidedStepDetail> = {
  overview: {
    route: '/',
    targetId: 'overview',
    title: 'Review workspace posture',
    description: 'Start from the indexed TELCO evidence and the calculated 42/100 posture.',
  },
  'run-inventory': {
    route: '/inventaire',
    targetId: 'run-inventory',
    title: 'Run discovery',
    description: 'Index the TELCO source package without inferring component activation on a target.',
  },
  'run-audit': {
    route: '/audit',
    targetId: 'run-audit',
    title: 'Run finding analysis',
    description: 'Analyze indexed evidence, risk, change sets, and validation boundaries.',
  },
  'open-f001': {
    route: '/audit',
    targetId: 'open-f001',
    title: 'Inspect the prioritized finding',
    description: 'Inspect F-001, its indexed database-account evidence, and its provenance boundary.',
  },
  'apply-remediation': {
    route: '/remediation',
    targetId: 'apply-F-001',
    title: 'Prepare the priority change set',
    description: 'Apply the F-001 change set as a workspace operation. Target verification remains pending.',
  },
  'run-validation': {
    route: '/validation',
    targetId: 'run-validation',
    title: 'Run control campaign',
    description: 'Run the provider-backed multi-phase control campaign. Target verification remains pending.',
  },
  'review-comparison': {
    route: '/rapport',
    targetId: 'review-comparison',
    title: 'Review change-set comparison',
    description: 'Review indexed evidence, generated change sets, controls, and their provenance limits.',
  },
  'finish-report': {
    route: '/rapport',
    targetId: 'finish-report',
    title: 'Print provenance report',
    description: 'Print the report with source-package provenance and target verification pending status.',
  },
}
