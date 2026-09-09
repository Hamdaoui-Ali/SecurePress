import type { PropsWithChildren } from 'react'
import { clsx } from 'clsx'

export type BadgeTone =
  | 'demo'
  | 'critical'
  | 'high'
  | 'medium'
  | 'success'
  | 'prepared'
  | 'neutral'

interface BadgeProps {
  tone?: BadgeTone
}

export function Badge({
  tone = 'neutral',
  children,
}: PropsWithChildren<BadgeProps>) {
  return <span className={clsx('badge', `badge-${tone}`)}>{children}</span>
}
