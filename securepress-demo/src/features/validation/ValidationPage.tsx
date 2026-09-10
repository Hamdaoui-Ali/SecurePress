import { ClipboardCheck, ShieldCheck } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { HardeningControl } from './HardeningControl'
import { LoginAttemptsDemo } from './LoginAttemptsDemo'
import { UploadPolicyDemo } from './UploadPolicyDemo'
import { TestGroup } from './TestGroup'

const hardeningControls = telcoScenario.validationChecks
  .filter((check) => check.category === 'hardening')
  .map((check) => ({
    id: check.id,
    title: check.title,
    description: 'Contrôle de durcissement préparé pour le workspace TELCO.',
    expectedResult: check.expectedResult,
  }))

const groupDefinitions = [
  {
    title: 'Public',
    description: 'Surfaces visibles sans privilège.',
    checkIds: ['V-COMMENTS'],
  },
  {
    title: 'Administration',
    description: 'Parcours d’administration et transport attendu.',
    checkIds: ['V-HTTPS-TARGET'],
  },
  {
    title: 'Info Cards',
    description: 'Secrets et informations de configuration présentés dans les cartes.',
    checkIds: ['V-WP-SALTS'],
  },
  {
    title: 'WooCommerce',
    description: 'Revue de versions et compatibilité des composants métier.',
    checkIds: ['V-COMPONENT-VERSIONS'],
  },
  {
    title: 'Durcissement',
    description: 'Contrôles de réduction de surface d’attaque.',
    checkIds: ['V-FILE-EDITOR', 'V-XMLRPC-TARGET'],
  },
  {
    title: 'Intégrité',
    description: 'Secrets, fichiers et permissions à confirmer.',
    checkIds: ['V-DB-ACCOUNT', 'V-DB-PASSWORD', 'V-BACKUP-TARGET', 'V-PERMISSIONS'],
  },
  {
    title: 'Non-régression',
    description: 'Parcours locaux à rejouer après correction.',
    checkIds: [],
    emptyMessage:
      'Les contrôles locaux de connexion et de téléversement restent rejouables ci-dessus.',
  },
]

export function ValidationPage() {
  const { state, busy, progress, runHardeningCheck, runValidation } = useAssessment()

  const checksById = new Map(
    telcoScenario.validationChecks.map((check) => [check.id, check]),
  )
  const externalStatus = state.validationResults['external-dynamic-retest']

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">ÉTAPE 5 · VALIDATION</p>
        <h2>Run controls with explicit provenance</h2>
        <p>
          Les contrôles sont des opérations locales déterministes fondées sur les
          preuves TELCO indexées. Un résultat PASS ne remplace pas la vérification
          de la cible.
        </p>
      </div>

      {!state.auditCompleted ? (
        <div className="prerequisite-banner" role="status">
          <ShieldCheck aria-hidden="true" size={19} />
          <span>Complete finding analysis before running controls</span>
        </div>
      ) : null}

      <Card title="Control campaign" eyebrow="CONTROLS OPERATION">
        <div className="validation-launch">
          <div>
            <p>
              Run the multi-phase control campaign. Results retain their local
              evidence boundary while target verification remains pending.
            </p>
            {progress && busy ? (
              <div className="validation-progress" aria-live="polite">
                <span className="progress-pulse" aria-hidden="true" />
                <strong>{progress.message}</strong>
                <span>{progress.percent}%</span>
              </div>
            ) : null}
          </div>
          <Button
            disabled={!state.auditCompleted}
            busy={busy}
            onClick={() => void runValidation()}
            data-guide-id="run-validation"
          >
            <ClipboardCheck aria-hidden="true" size={16} />
            Run control campaign
          </Button>
        </div>
        {state.validationResults['external-dynamic-retest'] ? (
          <div className="validation-result-banner">
            <StatusBadge
              label="Control campaign completed · target verification pending"
              tone="success"
            />
            <div className="external-retest-banner">
            <StatusBadge
              label="Contre-audit dynamique externe — NON EXÉCUTÉ"
              tone="prepared"
            />
            <span>Plan the external campaign only for the authorized target.</span>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="validation-demo-grid">
        <LoginAttemptsDemo />
        <UploadPolicyDemo />
      </div>

      <Card title="Contrôles de durcissement" eyebrow="MESURES LOCALES">
        <div className="hardening-control-grid">
          {hardeningControls.map((control) => (
            <HardeningControl
              key={control.id}
              control={control}
              completed={state.completedHardeningCheckIds.includes(control.id)}
              busy={busy}
              auditCompleted={state.auditCompleted}
              onRun={() => void runHardeningCheck(control.id)}
            />
          ))}
        </div>
      </Card>

      <section className="validation-groups" aria-labelledby="validation-groups-title">
        <div className="section-heading-inline">
          <div>
            <p className="eyebrow">CAMPAGNE PAR PÉRIMÈTRE</p>
            <h2 id="validation-groups-title">Résultats et limites</h2>
          </div>
          <StatusBadge
            label={externalStatus ? 'Control campaign completed' : 'En attente'}
            tone={externalStatus ? 'success' : 'prepared'}
          />
        </div>
        <div className="validation-group-grid">
          {groupDefinitions.map((group) => (
            <TestGroup
              key={group.title}
              title={group.title}
              description={group.description}
              checks={group.checkIds
                .map((checkId) => checksById.get(checkId))
                .filter((check): check is NonNullable<typeof check> => Boolean(check))}
              results={state.validationResults}
              emptyMessage={group.emptyMessage}
            />
          ))}
          <TestGroup
            title="Contre-vérification"
            description="Ce qui doit encore être démontré sur la cible autorisée."
            results={state.validationResults}
            emptyMessage={
              externalStatus
                ? 'La contre-vérification dynamique est explicitement restée hors périmètre.'
                : 'Aucun contrôle externe n’a encore été lancé.'
            }
          />
        </div>
      </section>
    </div>
  )
}
