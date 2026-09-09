import { useId, type PropsWithChildren } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  title: string
  eyebrow?: string
  className?: string
}

export function Card({
  title,
  eyebrow,
  className,
  children,
}: PropsWithChildren<CardProps>) {
  const titleId = useId()

  return (
    <section className={clsx('card', className)} aria-labelledby={titleId}>
      {eyebrow ? <p className="card-eyebrow">{eyebrow}</p> : null}
      <h2 id={titleId} className="card-title">
        {title}
      </h2>
      {children}
    </section>
  )
}
