import { Link } from 'react-router'
import { Avatar } from '../../atoms/Avatar/Avatar.tsx'
import { Tag } from '../../atoms/Tag/Tag.tsx'
import { PostActions } from '../PostActions/PostActions.tsx'
import { PostThumbnail } from '../PostThumbnail/PostThumbnail.tsx'
import type { Post } from '../../../types/posts.ts'

type PostCardProps = {
  post: Post
  onLike: () => void
  onShare: () => void
  onComment: () => void
  isLikePending?: boolean
  headingLevel?: 1 | 2
  isDetail?: boolean
}

export function PostCard({
  post,
  onLike,
  onShare,
  onComment,
  isLikePending = false,
  headingLevel = 2,
  isDetail = false,
}: PostCardProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const title = isDetail ? (
    <Heading className="text-2xl font-semibold text-content">{post.title}</Heading>
  ) : (
    <Heading className="text-lg font-semibold text-content-muted">
      <Link
        to={`/posts/${post.id}`}
        className="transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {post.title}
      </Link>
    </Heading>
  )

  const image = (
    <PostThumbnail
      src={post.thumbnailUrl}
      alt={`Miniatura do post: ${post.title}`}
      className="aspect-[486/240] w-full"
      loading={isDetail ? 'eager' : 'lazy'}
    />
  )

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-surface">
      {isDetail ? (
        image
      ) : (
        <Link
          to={`/posts/${post.id}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
        >
          {image}
        </Link>
      )}

      <div className="flex flex-1 flex-col gap-4 p-4">
        {title}
        <p
          className={`text-sm leading-relaxed text-content-muted ${
            isDetail ? 'whitespace-pre-wrap' : 'line-clamp-3'
          }`}
        >
          {post.content}
        </p>

        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Tags do post">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Tag label={tag} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-ink-800 pt-4">
          <PostActions
            liked={post.likedByMe}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            isLikePending={isLikePending}
          />
          <div className="flex items-center gap-2">
            <Avatar name={post.author.name} />
            <span className="text-sm text-content-muted">{post.author.name}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
