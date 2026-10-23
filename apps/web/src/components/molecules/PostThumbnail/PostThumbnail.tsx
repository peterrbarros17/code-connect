import { useState } from 'react'
import { API_URL } from '../../../services/api.ts'

type PostThumbnailProps = {
  src?: string | null
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

const PLACEHOLDER = '/posts/placeholder.png'

function resolvePostImage(src: string) {
  if (src.startsWith('/uploads/')) {
    return `${API_URL}${src}`
  }

  return src
}

export function PostThumbnail({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: PostThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = Boolean(src) && failedSrc === src

  return (
    <img
      src={hasError || !src ? PLACEHOLDER : resolvePostImage(src)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src ?? null)}
      className={`object-cover ${className}`}
    />
  )
}
