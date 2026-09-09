import { ClipboardCheck, ShieldCheck } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  HardeningControl,
  type HardeningControlDefinition,
} from './HardeningControl'
import { LoginAttemptsDemo } from './LoginAttemptsDemo'
import { UploadPolicyDemo } from './UploadPolicyDemo'
import { TestGroup } from './TestGroup'

const hardeningControls: HardeningControlDefinition[] = [
  {
    id: 'author-enumeration',
    title: 'Énumération par auteur',
    description:
      'Vérifier que les identifiants d’auteur ne sont pas exposés par les routes publiques.',
    expectedResult: 'Aucun identifiant administrateur n’est divulgué.',
  },
  {
    id: 'rest-users',
    title: 'Routes REST utilisateurs',
    description:
      'Contrôler la visibilité de la collection utilisateurs dans l’API WordPress.',
    expectedResult: 'La collection utilisateurs n’est pas publiquement énumérable.',
  },
  {
    id: 'version-disclosure',
    title: 'Divulgation de version',
    description:
      'Rechercher les marqueurs de version dans les réponses et métadonnées locales.',
    expectedResult: 'Les marqueurs inutiles sont masqués ou documentés.',
  },
  {
    id: 'file-editor',
    title: 'Éditeur de fichiers',
    description:
      'Vérifier la présence de la mesure DISALLOW_FILE_EDIT préparée.',
    expectedResult: 'L’éditeur de fichiers WordPress est indisponible.',
  },
]

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
      'Les démonstrations de connexion et de téléversement restent rejouables ci-dessus.',
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
        <h2>Tester la correction sans sur-promettre la preuve</h2>
        <p>
          Les contrôles ci-dessous sont déterministes et locaux. Une réussite simulée
          reste distincte d’une vérification sur l’environnement cible.
        </p>
      </div>

      {!state.auditCompleted ? (
        <div className="prerequisite-banner" role="status">
          <ShieldCheck aria-hidden="true" size={19} />
          <span>Terminez d’abord l’audit statique simulé</span>
        </div>
      ) : null}

      <Card title="Campagne de validation" eyebrow="LANCEMENT CONTRÔLÉ">
        <div className="validation-launch">
          <div>
            <p>
              Lancez les contrôles de non-régression et associez chaque résultat à
              sa limite de preuve.
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
            Lancer la validation simulée
          </Button>
        </div>
        {state.validationResults['external-dynamic-retest'] ? (
          <div className="validation-result-banner">
            <StatusBadge label="Validation simulée terminée" tone="success" />
            <div className="external-retest-banner">
            <StatusBadge
              label="Contre-audit dynamique externe — NON EXÉCUTÉ"
              tone="prepared"
            />
            <span>Une campagne externe reste à planifier sur la cible autorisée.</span>
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
            label={externalStatus ? 'Campagne exécutée' : 'En attente'}
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
