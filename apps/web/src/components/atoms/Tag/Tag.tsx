import type { ReactNode } from 'react'
import { Icon } from '../Icon/Icon.tsx'
import { icons } from '../../../constants/icons.ts'

type TagVariant = 'card' | 'selected' | 'suggestion'

type TagProps = {
  label: string
  variant?: TagVariant
  onClick?: () => void
  onRemove?: () => void
  className?: string
  children?: ReactNode
}

const styles: Record<TagVariant, string> = {
  card: 'bg-ink-800 text-content-muted',
  selected: 'bg-content-subtle text-surface',
  suggestion: 'bg-content-muted text-surface hover:bg-content',
}

function formatTag(tag: string) {
  return tag.charAt(0).toUpperCase() + tag.slice(1)
}

export function Tag({
  label,
  variant = 'card',
  onClick,
  onRemove,
  className = '',
  children,
}: TagProps) {
  const content = children ?? formatTag(label)
  const base = `inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${styles[variant]} ${className}`

  if (onRemove) {
    return (
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${formatTag(label)}`}
        className={`${base} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        {content}
        <Icon src={icons.close} className="size-2.5" />
      </button>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        {content}
      </button>
    )
  }

  return <span className={base}>{content}</span>
}
