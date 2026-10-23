import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { CommentForm } from '../../components/molecules/CommentForm/CommentForm.tsx'
import { CommentItem } from '../../components/molecules/CommentItem/CommentItem.tsx'
import { PostCard } from '../../components/molecules/PostCard/PostCard.tsx'
import { useAuth } from '../../contexts/auth-context.ts'
import { getErrorMessage } from '../../services/api.ts'
import {
  createComment,
  getPost,
  likePost,
  unlikePost,
} from '../../services/posts.ts'
import type { PostDetail } from '../../types/posts.ts'

export function PostDetailPage() {
  const { postId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likePending, setLikePending] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [isCommenting, setIsCommenting] = useState(false)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [shareMessage, setShareMessage] = useState('')

  const loadPost = useCallback(
    async (showLoading = true) => {
      if (!postId) {
        setError('Post não encontrado.')
        setIsLoading(false)
        return
      }

      if (showLoading) {
        setIsLoading(true)
      }

      setError(null)

      try {
        setPost(await getPost(postId))
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            'Não foi possível carregar o post. Tente novamente.',
          ),
        )
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    },
    [postId],
  )

  useEffect(() => {
    void loadPost()
  }, [loadPost, user?.id])

  async function handleLike() {
    if (!post) {
      return
    }

    if (!user) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }

    const nextLiked = !post.likedByMe
    const previous = { likedByMe: post.likedByMe, likesCount: post.likesCount }

    setLikePending(true)
    setPost({
      ...post,
      likedByMe: nextLiked,
      likesCount: post.likesCount + (nextLiked ? 1 : -1),
    })

    try {
      const result = nextLiked ? await likePost(post.id) : await unlikePost(post.id)

      setPost((current) =>
        current
          ? { ...current, likedByMe: result.liked, likesCount: result.likesCount }
          : current,
      )
    } catch {
      setPost((current) => (current ? { ...current, ...previous } : current))
      setError('Não foi possível atualizar a curtida. Tente novamente.')
    } finally {
      setLikePending(false)
    }
  }

  async function handleShare() {
    if (!post) {
      return
    }

    const url = `${window.location.origin}/posts/${post.id}`

    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url })
        setShareMessage('Post compartilhado.')
        return
      }

      await navigator.clipboard.writeText(url)
      setShareMessage('Link do post copiado.')
    } catch {
      setShareMessage('Não foi possível compartilhar o post.')
    }
  }

  async function handleComment(content: string, parentId?: string) {
    if (!post) {
      return
    }

    setCommentError(null)
    setIsCommenting(true)

    try {
      const comment = await createComment(post.id, { content, parentId })

      setPost((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          comments: [...current.comments, comment],
          commentsCount: current.commentsCount + 1,
        }
      })
      setReplyToId(null)
    } catch (requestError) {
      setCommentError(
        getErrorMessage(
          requestError,
          'Não foi possível publicar o comentário. Tente novamente.',
        ),
      )
      throw requestError
    } finally {
      setIsCommenting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-semibold text-content">Carregando post...</h1>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-2xl font-semibold text-content">Post não encontrado</h1>
        <p role="alert" className="text-content-muted">
          {error ?? 'O post que você procura não existe ou foi removido.'}
        </p>
        <Link
          to="/"
          className="rounded text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Voltar para o feed
        </Link>
      </div>
    )
  }

  const topLevelComments = post.comments.filter((comment) => !comment.parentId)

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="w-fit rounded text-sm text-content-muted underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Voltar para o feed
      </Link>

      {error && (
        <p role="alert" className="rounded bg-surface p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {shareMessage && (
        <p role="status" className="text-sm text-content-muted">
          {shareMessage}
        </p>
      )}

      <PostCard
        post={post}
        onLike={() => void handleLike()}
        onComment={() =>
          document.getElementById('comentarios')?.scrollIntoView({
            behavior: 'smooth',
          })
        }
        onShare={() => void handleShare()}
        isLikePending={likePending}
        headingLevel={1}
        isDetail
      />

      {post.code && (
        <section className="flex flex-col gap-3 rounded-lg bg-surface p-4" aria-labelledby="codigo">
          <h2 id="codigo" className="text-lg font-semibold text-content">
            Código:
          </h2>
          <pre className="overflow-x-auto rounded bg-page p-4 text-sm text-content-muted">
            <code>{post.code}</code>
          </pre>
        </section>
      )}

      <section
        id="comentarios"
        aria-labelledby="comentarios-titulo"
        className="flex flex-col gap-5 rounded-lg bg-surface p-4"
      >
        <h2 id="comentarios-titulo" className="text-xl font-semibold text-content">
          Comentários ({post.commentsCount})
        </h2>

        {commentError && (
          <p role="alert" className="text-sm text-danger">
            {commentError}
          </p>
        )}

        {topLevelComments.length === 0 ? (
          <p className="text-sm text-content-muted">
            Ainda não há comentários. Seja a primeira pessoa a comentar.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={post.comments.filter(
                  (reply) => reply.parentId === comment.id,
                )}
                canReply={Boolean(user)}
                onReply={() => setReplyToId(comment.id)}
                replyForm={
                  replyToId === comment.id ? (
                    <CommentForm
                      label={`Responder a ${comment.author.name}`}
                      placeholder="Escreva uma resposta..."
                      submitLabel="Responder"
                      isSubmitting={isCommenting}
                      onSubmit={(content) => handleComment(content, comment.id)}
                      onCancel={() => setReplyToId(null)}
                      autoFocus
                    />
                  ) : undefined
                }
              />
            ))}
          </ul>
        )}

        {user ? (
          <CommentForm
            label="Escreva um comentário"
            placeholder="Compartilhe sua opinião sobre o post..."
            submitLabel="Comentar"
            isSubmitting={isCommenting}
            onSubmit={(content) => handleComment(content)}
          />
        ) : (
          <p className="border-t border-ink-800 pt-5 text-sm text-content-muted">
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="rounded text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Entre
            </Link>{' '}
            para curtir e comentar neste post.
          </p>
        )}
      </section>
    </div>
  )
}
