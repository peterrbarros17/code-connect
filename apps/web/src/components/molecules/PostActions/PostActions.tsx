import type { ReactNode } from 'react'
import { Icon } from '../../atoms/Icon/Icon.tsx'
import { icons } from '../../../constants/icons.ts'

type PostActionsProps = {
  liked: boolean
  likesCount: number
  commentsCount: number
  onLike: () => void
  onComment: () => void
  onShare: () => void
  isLikePending?: boolean
}

type ActionButtonProps = {
  label: string
  icon: string
  count: number
  onClick: () => void
  pressed?: boolean
  disabled?: boolean
  hideCount?: boolean
  children?: ReactNode
}

function ActionButton({
  label,
  icon,
  count,
  onClick,
  pressed,
  disabled,
  hideCount,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className="inline-flex items-center gap-1.5 rounded text-sm text-content-subtle transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
    >
      <Icon src={icon} className="size-5" />
      {!hideCount && <span>{count}</span>}
      {children}
    </button>
  )
}

export function PostActions({
  liked,
  likesCount,
  commentsCount,
  onLike,
  onComment,
  onShare,
  isLikePending = false,
}: PostActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <ActionButton
        label={liked ? 'Descurtir este post' : 'Curtir este post'}
        icon={liked ? icons.like : icons.likeOutline}
        count={likesCount}
        onClick={onLike}
        pressed={liked}
        disabled={isLikePending}
      />
      <ActionButton
        label="Ver comentários deste post"
        icon={icons.chat}
        count={commentsCount}
        onClick={onComment}
      />
      <ActionButton
        label="Compartilhar este post"
        icon={icons.share}
        count={0}
        hideCount
        onClick={onShare}
      />
    </div>
  )
}
