import { useEffect, useState } from 'react'
import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import type { OperationKind, OperationRun } from '../../domain/models'

const operationTitles: Record<OperationKind, string> = {
  discovery: 'Discovery run',
  analysis: 'Finding analysis',
  'change-set': 'Change set',
  controls: 'Control campaign',
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

function useElapsedDuration(operation: OperationRun | null): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (operation?.status !== 'running') return

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [operation?.id, operation?.status])

  if (operation === null) return null
  if (operation.status !== 'running') return operation.durationMs ?? null

  return Math.max(0, now - Date.parse(operation.startedAt))
}

function statusLabel(status: OperationRun['status']): string {
  switch (status) {
    case 'running':
      return 'Running'
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    default:
      return 'Idle'
  }
}

export function OperationProgress() {
  const { activeOperation, lastRun, progress } = useAssessment()
  const operation = activeOperation ?? lastRun
  const elapsedDuration = useElapsedDuration(operation)

  if (operation === null) return null

  const isRunning = operation.status === 'running'
  const percent = isRunning
    ? progress?.percent
    : operation.status === 'completed'
      ? 100
      : undefined
  const currentStep = isRunning ? progress?.step : operation.currentStep
  const processed = isRunning ? progress?.processed : operation.processed
  const total = isRunning ? progress?.total : operation.total
  const title = operationTitles[operation.kind]
  const StatusIcon = isRunning
    ? LoaderCircle
    : operation.status === 'completed'
      ? CircleCheck
      : CircleAlert

  return (
    <section
      className={`operation-progress operation-progress-${operation.status}`}
      aria-labelledby="operation-progress-title"
      aria-live="polite"
    >
      <div className="operation-progress-header">
        <div>
          <p className="operation-progress-eyebrow">Current operation</p>
          <h2 id="operation-progress-title">{title}</h2>
        </div>
        <span className="operation-status" data-status={operation.status}>
          <StatusIcon aria-hidden="true" size={16} />
          {statusLabel(operation.status)}
        </span>
      </div>

      <p className="operation-progress-message">{operation.message}</p>

      <div
        key={operation.id}
        className="operation-progress-track"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={
          percent === undefined
            ? 'Progress unavailable'
            : `${percent}% complete`
        }
      >
        <span style={{ width: `${percent ?? 0}%` }} />
      </div>

      <div className="operation-progress-details">
        {currentStep ? <span>{currentStep}</span> : <span>Awaiting operation details</span>}
        {processed !== undefined && total !== undefined ? (
          <span>{`${processed} of ${total} processed`}</span>
        ) : null}
        {elapsedDuration !== null ? (
          <span>
            {isRunning
              ? `Elapsed ${formatDuration(elapsedDuration)}`
              : `${operation.status === 'completed' ? 'Completed' : 'Failed'} in ${formatDuration(elapsedDuration)}`}
          </span>
        ) : null}
      </div>
    </section>
  )
}
