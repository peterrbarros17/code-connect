import type { ReactNode } from 'react'
import { Link } from 'react-router'

type TextLinkProps = {
  to: string
  children: ReactNode
  variant?: 'underline' | 'accent'
  className?: string
}

const variants = {
  underline: 'text-base text-offwhite underline underline-offset-2 hover:text-accent',
  accent: 'text-xl text-accent hover:brightness-90',
}

export function TextLink({ to, children, variant = 'underline', className = '' }: TextLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-accent ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
