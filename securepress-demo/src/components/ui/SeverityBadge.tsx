import type { Severity } from '../../domain/models'
import { Badge } from './Badge'

const labels: Record<Severity, string> = {
  critical: 'Critique',
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible',
  variable: 'Sévérité variable',
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
