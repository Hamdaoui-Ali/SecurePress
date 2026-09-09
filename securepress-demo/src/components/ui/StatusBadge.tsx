import type { BadgeTone } from './Badge'
import { Badge } from './Badge'

interface StatusBadgeProps {
  label: string
  tone?: BadgeTone
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return <Badge tone={tone}>{label}</Badge>
}
