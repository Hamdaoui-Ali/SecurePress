import type { TimelineEvent } from '../../domain/models'

interface AssessmentTimelineProps {
  events: TimelineEvent[]
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function AssessmentTimeline({ events }: AssessmentTimelineProps) {
  const orderedEvents = events
    .map((event, index) => ({ event, index }))
    .sort((left, right) => {
      const timestampDifference =
        Date.parse(left.event.timestamp) - Date.parse(right.event.timestamp)
      return timestampDifference || left.index - right.index
    })
    .map(({ event }) => event)

  return (
    <section className="timeline-panel" aria-labelledby="timeline-title">
      <div className="report-section-heading">
        <div>
          <p className="eyebrow">TRACE DE SESSION</p>
          <h2 id="timeline-title">Chronologie des actions déclenchées</h2>
        </div>
        <span className="timeline-count">{orderedEvents.length} événement{orderedEvents.length > 1 ? 's' : ''}</span>
      </div>
      {orderedEvents.length > 0 ? (
        <ol className="assessment-timeline" aria-label="Chronologie de session">
          {orderedEvents.map((event) => (
            <li key={event.id}>
              <span className="timeline-marker" aria-hidden="true" />
              <div>
                <strong>{event.label}</strong>
                <time dateTime={event.timestamp}>{formatTimestamp(event.timestamp)}</time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="timeline-empty">Aucun événement déclenché dans cette session.</p>
      )}
    </section>
  )
}
