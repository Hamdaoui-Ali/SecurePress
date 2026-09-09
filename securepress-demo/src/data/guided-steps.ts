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
    title: 'Lire la posture initiale',
    description: 'Commencez par la vue d’ensemble : la copie TELCO part d’un indice pédagogique de 42/100.',
  },
  'run-inventory': {
    route: '/inventaire',
    targetId: 'run-inventory',
    title: 'Lancer l’inventaire local',
    description: 'Confirmez la présence des composants dans les fichiers sans déduire leur activation.',
  },
  'run-audit': {
    route: '/audit',
    targetId: 'run-audit',
    title: 'Qualifier les constats',
    description: 'L’audit statique relie les preuves locales, le risque, la remédiation et la validation.',
  },
  'open-f001': {
    route: '/audit',
    targetId: 'open-f001',
    title: 'Ouvrir le constat prioritaire',
    description: 'Ouvrez F-001 pour examiner la preuve du compte de base root et sa limite.',
  },
  'apply-remediation': {
    route: '/remediation',
    targetId: 'apply-F-001',
    title: 'Préparer la correction',
    description: 'Appliquez F-001 dans la simulation : aucune configuration réelle ne sera modifiée.',
  },
  'run-validation': {
    route: '/validation',
    targetId: 'run-validation',
    title: 'Lancer la validation simulée',
    description: 'Exécutez les contrôles locaux et gardez le contre-audit dynamique externe hors périmètre.',
  },
  'review-comparison': {
    route: '/rapport',
    targetId: 'review-comparison',
    title: 'Lire la comparaison',
    description: 'Le rapport relie l’état initial, l’état proposé, la validation et la limite de preuve.',
  },
  'finish-report': {
    route: '/rapport',
    targetId: 'finish-report',
    title: 'Terminer avec le rapport',
    description: 'Le rapport peut être imprimé pour la soutenance, avec ses disclaimers de simulation locale.',
  },
}
