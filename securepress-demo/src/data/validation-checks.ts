import type { ValidationCheck } from '../domain/models'

export const validationChecks: ValidationCheck[] = [
  {
    id: 'V-DB-ACCOUNT',
    title: 'Compte de base dédié',
    category: 'integrity',
    expectedResult: 'La configuration cible utilise telco_app avec les privilèges attendus.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-DB-PASSWORD',
    title: 'Secret de base non vide',
    category: 'integrity',
    expectedResult: 'Le secret de base est présent, fort et absent des artefacts publics.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-WP-SALTS',
    title: 'Clés et sels uniques',
    category: 'integrity',
    expectedResult: 'Les clés et sels diffèrent des exemples et sont propres à la cible.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-FILE-EDITOR',
    title: 'Éditeur de fichiers désactivé',
    category: 'hardening',
    expectedResult: 'L’éditeur de fichiers WordPress est indisponible.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-HTTPS-TARGET',
    title: 'HTTPS administration',
    category: 'retest',
    expectedResult: 'Les parcours d’administration redirigent et restent en HTTPS sur cible.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-COMPONENT-VERSIONS',
    title: 'Revue des versions',
    category: 'retest',
    expectedResult: 'Les versions sont supportées et leur exploitabilité est requalifiée sur cible.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-XMLRPC-TARGET',
    title: 'Restriction XML-RPC',
    category: 'hardening',
    expectedResult: 'Les appels XML-RPC non requis sont bloqués sur cible.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-BACKUP-TARGET',
    title: 'Protection des sauvegardes',
    category: 'integrity',
    expectedResult: 'Aucune sauvegarde sensible n’est servie depuis le répertoire public.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-PERMISSIONS',
    title: 'Permissions de fichiers',
    category: 'integrity',
    expectedResult: 'Les permissions cible correspondent à la procédure préparée.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-COMMENTS',
    title: 'Modération des commentaires',
    category: 'functional',
    expectedResult: 'Les commentaires publics suivent les réglages de modération attendus.',
    initialStatus: 'not_run',
  },
]
