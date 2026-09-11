import type { ValidationCheck } from '../domain/models'

export const validationChecks: ValidationCheck[] = [
  {
    id: 'V-DB-ACCOUNT',
    title: 'Dedicated database account',
    category: 'integrity',
    expectedResult: 'The target configuration uses telco_app with the expected privileges.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-DB-PASSWORD',
    title: 'Non-empty database secret',
    category: 'integrity',
    expectedResult: 'The database secret is present, strong, and absent from public artifacts.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-WP-SALTS',
    title: 'Unique keys and salts',
    category: 'integrity',
    expectedResult: 'Keys and salts differ from examples and are unique to the target.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-FILE-EDITOR',
    title: 'File editor disabled',
    category: 'hardening',
    expectedResult: 'The WordPress file editor is unavailable.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-HTTPS-TARGET',
    title: 'Administration HTTPS',
    category: 'retest',
    expectedResult: 'Administration paths redirect and remain on HTTPS on the target.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-COMPONENT-VERSIONS',
    title: 'Version review',
    category: 'retest',
    expectedResult: 'Versions are supported and exploitability is requalified on the target.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-XMLRPC-TARGET',
    title: 'XML-RPC restriction',
    category: 'hardening',
    expectedResult: 'Unneeded XML-RPC calls are blocked on the target.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-BACKUP-TARGET',
    title: 'Backup protection',
    category: 'integrity',
    expectedResult: 'No sensitive backup is served from the public directory.',
    initialStatus: 'target_validation_required',
  },
  {
    id: 'V-PERMISSIONS',
    title: 'File permissions',
    category: 'integrity',
    expectedResult: 'Target permissions match the prepared procedure.',
    initialStatus: 'not_run',
  },
  {
    id: 'V-COMMENTS',
    title: 'Comment moderation',
    category: 'functional',
    expectedResult: 'Public comments follow the expected moderation settings.',
    initialStatus: 'not_run',
  },
]
