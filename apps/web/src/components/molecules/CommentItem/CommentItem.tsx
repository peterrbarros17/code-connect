import type { ReactNode } from 'react'
import { Avatar } from '../../atoms/Avatar/Avatar.tsx'
import type { PostComment } from '../../../types/posts.ts'

type CommentItemProps = {
  comment: PostComment
  replies?: PostComment[]
  canReply?: boolean
  onReply?: () => void
  replyForm?: ReactNode
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function CommentItem({
  comment,
  replies = [],
  canReply = false,
  onReply,
  replyForm,
}: CommentItemProps) {
  return (
    <li className="flex flex-col gap-4">
      <article className="flex gap-3">
        <Avatar name={comment.author.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-content">{comment.author.name}</span>
            <time dateTime={comment.createdAt} className="text-xs text-content-subtle">
              {formatDate(comment.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
            {comment.content}
          </p>
          {canReply && onReply && (
            <button
              type="button"
              onClick={onReply}
              className="mt-2 rounded text-sm font-medium text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Responder
            </button>
          )}
          {replyForm && <div className="mt-4">{replyForm}</div>}
        </div>
      </article>

      {replies.length > 0 && (
        <ul className="ml-11 flex flex-col gap-4 border-l border-ink-800 pl-4">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </ul>
      )}
    </li>
  )
}
