import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '../../components/atoms/Button/Button.tsx'
import { buttonClassName } from '../../components/atoms/Button/buttonStyles.ts'
import { Input } from '../../components/atoms/Input/Input.tsx'
import { Label } from '../../components/atoms/Label/Label.tsx'
import { Tag } from '../../components/atoms/Tag/Tag.tsx'
import { Textarea } from '../../components/atoms/Textarea/Textarea.tsx'
import { PostThumbnail } from '../../components/molecules/PostThumbnail/PostThumbnail.tsx'
import { useAuth } from '../../contexts/auth-context.ts'
import { getErrorMessage } from '../../services/api.ts'
import { createPost, uploadPostThumbnail } from '../../services/posts.ts'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_TAGS = 5
const MAX_FILE_BYTES = 5 * 1024 * 1024

export function CreatePostPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [code, setCode] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previewUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    },
    [],
  )

  function changeFile(selected: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    previewUrlRef.current = selected ? URL.createObjectURL(selected) : null
    setPreviewUrl(previewUrlRef.current)
    setFile(selected)
  }

  if (isLoading) {
    return <h1 className="text-2xl font-semibold text-content">Carregando...</h1>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/publicar' }} />
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase()

    if (!tag) {
      return
    }

    if (tags.includes(tag)) {
      setTagInput('')
      return
    }

    if (tags.length >= MAX_TAGS) {
      setError(`Você pode adicionar no máximo ${MAX_TAGS} tags.`)
      return
    }

    setError(null)
    setTags((current) => [...current, tag])
    setTagInput('')
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setError(null)

    if (!selected) {
      changeFile(null)
      return
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Envie uma imagem JPG, PNG, WEBP ou GIF.')
      event.target.value = ''
      return
    }

    if (selected.size > MAX_FILE_BYTES) {
      setError('A imagem deve ter no máximo 5 MB.')
      event.target.value = ''
      return
    }

    changeFile(selected)
  }

  function removeFile() {
    changeFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (trimmedTitle.length < 3) {
      setError('O título precisa ter pelo menos 3 caracteres.')
      return
    }

    if (trimmedContent.length < 10) {
      setError('A descrição precisa ter pelo menos 10 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      const upload = file ? await uploadPostThumbnail(file) : null
      const post = await createPost({
        title: trimmedTitle,
        content: trimmedContent,
        code: code.trim() || undefined,
        thumbnailUrl: upload?.url,
        tags,
      })

      navigate(`/posts/${post.id}`, { replace: true })
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível publicar o post. Tente novamente.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-content">Novo post</h1>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,486px)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4 rounded-lg bg-surface p-4" aria-labelledby="imagem-titulo">
          <h2 id="imagem-titulo" className="text-lg font-semibold text-content">
            Imagem do post
          </h2>

          <PostThumbnail
            src={previewUrl}
            alt={previewUrl ? 'Prévia da imagem selecionada' : 'Imagem padrão do post'}
            className="aspect-[486/240] w-full rounded"
          />

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="post-thumbnail"
              className={buttonClassName(
                'outline',
                'w-auto cursor-pointer px-5',
                'sm',
              )}
            >
              Carregar imagem
            </label>
            <input
              ref={fileInputRef}
              id="post-thumbnail"
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
              className="sr-only"
            />
            {file && (
              <div className="flex min-w-0 items-center gap-2">
                <span className="max-w-48 truncate text-sm text-content-muted">{file.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remover imagem selecionada"
                  className="rounded px-2 py-1 text-content-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-content-subtle">
            Formatos aceitos: JPG, PNG, WEBP ou GIF, até 5 MB. Sem imagem, usamos a arte padrão.
          </p>
        </section>

        <section className="flex flex-col gap-5 rounded-lg bg-surface p-4" aria-labelledby="dados-titulo">
          <h2 id="dados-titulo" className="sr-only">
            Dados do post
          </h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="post-title">Nome do post</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="post-content">Descrição</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={10000}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="post-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="post-tags"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTag()
                  }
                }}
                maxLength={30}
                placeholder="Ex.: react"
              />
              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded border border-accent px-4 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Adicionar
              </button>
            </div>
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tags adicionadas">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Tag
                      label={tag}
                      variant="selected"
                      onRemove={() => setTags((current) => current.filter((item) => item !== tag))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="post-code">Código (opcional)</Label>
            <Textarea
              id="post-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={10000}
              className="min-h-40 font-mono text-sm"
            />
          </div>

          {error && (
            <p role="alert" className="rounded bg-page px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              size="sm"
              className="w-auto px-6"
              disabled={isSubmitting}
            >
              Descartar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="w-auto px-8"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </section>
      </form>
    </div>
  )
}
