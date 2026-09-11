import { ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import { selectCampaignCheckState } from '../../domain/operation-view'
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
    description: `Prepared hardening control for the ${telcoScenario.project.name} workspace.`,
    expectedResult: check.expectedResult,
    initialStatus: check.initialStatus,
  }))

const groupDefinitions = [
  {
    title: 'Public',
    description: 'Surfaces visible without elevated privileges.',
    checkIds: ['V-COMMENTS'],
  },
  {
    title: 'Administration',
    description: 'Administration paths and expected transport controls.',
    checkIds: ['V-HTTPS-TARGET'],
  },
  {
    title: 'Info Cards',
    description: 'Secrets and configuration information represented in the cards.',
    checkIds: ['V-WP-SALTS'],
  },
  {
    title: 'WooCommerce',
    description: 'Review of versions and business-component compatibility.',
    checkIds: ['V-COMPONENT-VERSIONS'],
  },
  {
    title: 'Hardening',
    description: 'Controls that reduce the attack surface.',
    checkIds: ['V-FILE-EDITOR', 'V-XMLRPC-TARGET'],
  },
  {
    title: 'Integrity',
    description: 'Secrets, files, and permissions that require confirmation.',
    checkIds: ['V-DB-ACCOUNT', 'V-DB-PASSWORD', 'V-BACKUP-TARGET', 'V-PERMISSIONS'],
  },
  {
    title: 'Regression',
    description: 'Local paths to replay after a workspace change.',
    checkIds: [],
    emptyMessage: 'Local login and upload controls remain replayable above.',
  },
]

export function ValidationPage() {
  const { state, busy, progress, activeOperation, runHardeningCheck, runValidation } = useAssessment()

  const checksById = new Map(
    telcoScenario.validationChecks.map((check) => [check.id, check]),
  )
  const externalStatus = state.validationResults['external-dynamic-retest']
  const campaignStates = selectCampaignCheckState(
    telcoScenario.validationChecks,
    state,
    activeOperation,
    progress,
  )

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">STEP 5 · VALIDATION</p>
        <h2>Run controls with explicit provenance</h2>
        <p>
          Controls are deterministic local operations based on indexed {telcoScenario.project.name} evidence. A PASS result does not replace verification on the target.
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
              Run the multi-phase control campaign. Results retain their local evidence boundary
              while target verification remains pending.
            </p>
            {progress && busy ? (
              <div className="validation-progress" aria-live="polite">
                <span className="progress-pulse" aria-hidden="true" />
                <strong>{progress.message}</strong>
                <span>{progress.processed} of {progress.total} controls processed</span>
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
                label="External dynamic retest — NOT EXECUTED"
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

      <Card title="Hardening controls" eyebrow="LOCAL MEASURES">
        <div className="hardening-control-grid">
          {hardeningControls.map((control) => (
            <HardeningControl
              key={control.id}
              control={control}
              completed={state.completedHardeningCheckIds.includes(control.id)}
              status={campaignStates[control.id]}
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
            <p className="eyebrow">CAMPAIGN BY SCOPE</p>
            <h2 id="validation-groups-title">Results and limits</h2>
          </div>
          <StatusBadge
            label={externalStatus ? 'Control campaign completed' : 'Awaiting results'}
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
              results={campaignStates}
              emptyMessage={group.emptyMessage}
            />
          ))}
          <TestGroup
            title="External retest"
            description="Evidence that must still be demonstrated on the authorized target."
            results={campaignStates}
            emptyMessage={
              externalStatus
                ? 'The dynamic retest was explicitly kept outside this local workspace.'
                : 'No external control campaign has been launched.'
            }
          />
        </div>
      </section>

      {externalStatus === 'dynamic_retest_not_executed' && !busy ? (
        <div className="workflow-continue">
          <div>
            <p className="eyebrow">NEXT OPERATION</p>
            <strong>Control campaign is complete</strong>
            <span>Review the evidence trail and download the final report.</span>
          </div>
          <Link className="button button-primary" to="/rapport">
            Review report
          </Link>
        </div>
      ) : null}
    </div>
  )
}
