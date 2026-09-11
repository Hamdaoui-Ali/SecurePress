import type { Severity } from '../../domain/models'
import { Badge } from './Badge'

const labels: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  variable: 'Variable severity',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const tone =
    severity === 'critical'
      ? 'critical'
      : severity === 'high' || severity === 'medium'
        ? 'high'
        : 'neutral'

  return <Badge tone={tone}>{labels[severity]}</Badge>
}
