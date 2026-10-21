import type { ReactNode } from 'react'

type HeadingProps = {
  level?: 1 | 2
  children: ReactNode
  className?: string
}

const styles = {
  1: 'text-3xl font-semibold',
  2: 'text-xl',
}

export function Heading({ level = 1, children, className = '' }: HeadingProps) {
  const Tag = level === 1 ? 'h1' : 'h2'
  return <Tag className={`text-content ${styles[level]} ${className}`}>{children}</Tag>
}
