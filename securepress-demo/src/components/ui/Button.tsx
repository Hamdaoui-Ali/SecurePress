import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { clsx } from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  busy?: boolean
}

export function Button({
  variant = 'primary',
  busy = false,
  disabled,
  children,
  className,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={clsx('button', `button-${variant}`, className)}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? 'En cours…' : children}
    </button>
  )
}
