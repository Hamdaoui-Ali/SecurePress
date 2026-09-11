import { CheckCircle2, Circle, CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import type { WorkspaceSource } from '../../domain/models'
import type { SourceCheckProgress } from '../../app/AssessmentProvider'

interface SourceStatusProps {
  source: WorkspaceSource
  candidateLabel?: string
  checking: boolean
  progress: SourceCheckProgress | null
  pickerError?: string
}

function statusLabel(source: WorkspaceSource, checking: boolean): string {
  if (checking) return 'Verifying source'
  if (source.status === 'ready') return 'Source verified'
  if (source.status === 'invalid') return 'Source verification failed'
  return 'Not registered'
}

export function SourceStatus({
  source,
  candidateLabel,
  checking,
  progress,
  pickerError,
}: SourceStatusProps) {
  const message = pickerError ?? progress?.message ?? source.message
  const Icon = checking
    ? LoaderCircle
    : source.status === 'ready'
      ? CircleCheck
      : source.status === 'invalid'
        ? CircleAlert
        : null

  return (
    <section
      className={`source-status source-status-${source.status}`}
      role="status"
      aria-label="Source verification status"
      aria-live="polite"
    >
      <div className="source-status-heading">
        <span className="source-status-label">
          {Icon ? <Icon aria-hidden="true" size={18} /> : null}
          {statusLabel(source, checking)}
        </span>
        {progress && checking ? <span>{progress.percent}%</span> : null}
      </div>
      <strong>{source.displayName || candidateLabel || 'No source selected'}</strong>
      <p>{message}</p>
      {checking && progress ? (
        <ol className="source-check-list" aria-label="Source verification checklist">
          {progress.steps.map((step) => {
            const StepIcon =
              step.status === 'complete'
                ? CheckCircle2
                : step.status === 'running'
                  ? LoaderCircle
                  : Circle

            return (
              <li
                key={step.id}
                className={`source-check-step source-check-step-${step.status}`}
                aria-current={step.status === 'running' ? 'step' : undefined}
              >
                <StepIcon aria-hidden="true" size={17} />
                <span>{step.label}</span>
                <small>
                  {step.status === 'complete'
                    ? 'Complete'
                    : step.status === 'running'
                      ? 'Running'
                      : 'Pending'}
                </small>
              </li>
            )
          })}
        </ol>
      ) : null}
      {source.status === 'ready' && source.wordpressVersion ? (
        <p className="source-status-meta">
          WordPress {source.wordpressVersion} · {source.pluginCount} plugins · {source.themeCount} themes
        </p>
      ) : null}
    </section>
  )
}
