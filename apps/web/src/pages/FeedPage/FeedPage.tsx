import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FilterBar } from '../../components/molecules/FilterBar/FilterBar.tsx'
import { PostCard } from '../../components/molecules/PostCard/PostCard.tsx'
import { useAuth } from '../../contexts/auth-context.ts'
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts'
import { getErrorMessage } from '../../services/api.ts'
import {
  getPostTags,
  likePost,
  listPosts,
  unlikePost,
} from '../../services/posts.ts'
import type { Post, PostSort, PostTag } from '../../types/posts.ts'

export function FeedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState<PostSort>('recent')
  const [tags, setTags] = useState<PostTag[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likePendingId, setLikePendingId] = useState<string | null>(null)
  const [shareMessage, setShareMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    getPostTags()
      .then((result) => {
        if (isActive) {
          setTags(result)
        }
      })
      .catch(() => {
        if (isActive) {
          setTags([])
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    setIsLoading(true)
    setError(null)

    listPosts({
      search: debouncedSearch,
      tags: selectedTags,
      sort,
      limit: 50,
    })
      .then((result) => {
        if (!isActive) {
          return
        }

        setPosts(result.items)
        setTotal(result.total)
      })
      .catch((requestError: unknown) => {
        if (!isActive) {
          return
        }

        setError(
          getErrorMessage(
            requestError,
            'Não foi possível carregar o feed. Tente novamente.',
          ),
        )
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [debouncedSearch, selectedTags, sort, user?.id, reloadKey])

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  function clearFilters() {
    setSearch('')
    setSelectedTags([])
  }

  async function handleLike(post: Post) {
    if (!user) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }

    setLikePendingId(post.id)
    const nextLiked = !post.likedByMe
    const previous = { likedByMe: post.likedByMe, likesCount: post.likesCount }

    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              likedByMe: nextLiked,
              likesCount: item.likesCount + (nextLiked ? 1 : -1),
            }
          : item,
      ),
    )

    try {
      const result = nextLiked ? await likePost(post.id) : await unlikePost(post.id)

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, likedByMe: result.liked, likesCount: result.likesCount }
            : item,
        ),
      )
    } catch {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id ? { ...item, ...previous } : item,
        ),
      )
      setError('Não foi possível atualizar a curtida. Tente novamente.')
    } finally {
      setLikePendingId(null)
    }
  }

  async function handleShare(post: Post) {
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-content">Feed</h1>

        <div role="group" aria-label="Ordenar posts" className="flex gap-1">
          {[
            { value: 'recent' as const, label: 'Recentes' },
            { value: 'popular' as const, label: 'Populares' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSort(tab.value)}
              aria-pressed={sort === tab.value}
              className={`rounded px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                sort === tab.value
                  ? 'bg-surface text-accent'
                  : 'text-content-muted hover:text-content'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <FilterBar
        tags={tags}
        selectedTags={selectedTags}
        search={search}
        onSearchChange={setSearch}
        onToggleTag={toggleTag}
        onClear={clearFilters}
      />

      <p className="sr-only" aria-live="polite">
        {isLoading ? 'Carregando posts.' : `${total} posts encontrados.`}
      </p>

      {shareMessage && (
        <p role="status" className="text-sm text-content-muted">
          {shareMessage}
        </p>
      )}

      {error && (
        <div role="alert" className="rounded bg-surface p-4 text-sm text-danger">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-3 rounded font-semibold text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading && posts.length === 0 && (
        <p role="status" className="py-12 text-center text-content-muted">
          Carregando posts...
        </p>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="rounded-lg bg-surface p-8 text-center">
          <p className="text-content-muted">Nenhum post encontrado.</p>
          {(search || selectedTags.length > 0) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 rounded text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Limpar busca e filtros
            </button>
          )}
        </div>
      )}

      <ul
        className="grid gap-6 md:grid-cols-2"
        aria-busy={isLoading}
        aria-label="Posts do feed"
      >
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              onLike={() => void handleLike(post)}
              onComment={() => navigate(`/posts/${post.id}#comentarios`)}
              onShare={() => void handleShare(post)}
              isLikePending={likePendingId === post.id}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
