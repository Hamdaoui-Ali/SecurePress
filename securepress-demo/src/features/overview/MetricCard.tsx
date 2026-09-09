import { clsx } from 'clsx'

interface MetricCardProps {
  label: string
  value: string | number
  detail: string
  tone?: 'blue' | 'orange' | 'red' | 'neutral'
}

export function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: MetricCardProps) {
  return (
    <article className={clsx('metric-card', `metric-card-${tone}`)}>
      <p className="metric-label">{label}</p>
      <strong className="metric-value">{value}</strong>
      <p className="metric-detail">{detail}</p>
    </article>
  )
}
