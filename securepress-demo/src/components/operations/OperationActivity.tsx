import { Clock3 } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import type { OperationKind, OperationRun } from '../../domain/models'

const operationTitles: Record<OperationKind, string> = {
  discovery: 'Discovery run',
  analysis: 'Finding analysis',
  'change-set': 'Change set',
  controls: 'Control campaign',
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
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

export function OperationActivity() {
  const { activeOperation, lastRun, operationHistory } = useAssessment()
  const latestOperation = activeOperation ?? lastRun
  const recentOperations = operationHistory
    .filter((operation) => operation.id !== latestOperation?.id)
    .slice(0, 3)

  return (
    <section className="operation-activity" aria-labelledby="operation-activity-title">
      <div className="operation-activity-header">
        <div>
          <p className="operation-progress-eyebrow">Workspace activity</p>
          <h2 id="operation-activity-title">Latest operation</h2>
        </div>
        <Clock3 aria-hidden="true" size={18} />
      </div>

      {latestOperation ? (
        <div className="operation-activity-latest">
          <div>
            <strong>{operationTitles[latestOperation.kind]}</strong>
            <time dateTime={latestOperation.completedAt ?? latestOperation.startedAt}>
              {formatTimestamp(latestOperation.completedAt ?? latestOperation.startedAt)}
            </time>
          </div>
          <span className="operation-status" data-status={latestOperation.status}>
            {statusLabel(latestOperation.status)}
          </span>
        </div>
      ) : (
        <p className="operation-activity-empty">No recent operations</p>
      )}

      {recentOperations.length > 0 ? (
        <ul className="operation-activity-list" aria-label="Recent operations">
          {recentOperations.map((operation) => (
            <li key={operation.id}>
              <div>
                <span>{operation.message}</span>
                <time dateTime={operation.completedAt ?? operation.startedAt}>
                  {formatTimestamp(operation.completedAt ?? operation.startedAt)}
                </time>
              </div>
              <span className="operation-status" data-status={operation.status}>
                {statusLabel(operation.status)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
