import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import type { WorkspaceSource } from '../../domain/models'
import type { SourceCheckProgress } from '../../app/AssessmentProvider'

interface SourceStatusProps {
  source: WorkspaceSource
  checking: boolean
  progress: SourceCheckProgress | null
  pickerError?: string
}

function statusLabel(source: WorkspaceSource, checking: boolean): string {
  if (checking) return 'Verifying source'
  if (source.status === 'ready') return 'Source ready'
  if (source.status === 'invalid') return 'Source verification failed'
  return 'Not registered'
}

export function SourceStatus({
  source,
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
      <strong>{source.displayName || 'No source selected'}</strong>
      <p>{message}</p>
      {source.status === 'ready' && source.wordpressVersion ? (
        <p className="source-status-meta">
          WordPress {source.wordpressVersion} · {source.pluginCount} plugins · {source.themeCount} themes
        </p>
      ) : null}
    </section>
  )
}
