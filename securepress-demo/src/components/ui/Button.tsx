import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren } from 'react'
import { clsx } from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  busy?: boolean
}

export const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(function Button(
  {
    variant = 'primary',
    busy = false,
    disabled,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={props.type ?? 'button'}
      className={clsx('button', `button-${variant}`, className)}
      disabled={disabled || busy}
      aria-busy={busy || props['aria-busy'] || undefined}
    >
      {busy ? 'En cours…' : children}
    </button>
  )
})
