type AvatarProps = {
  name: string
  src?: string | null
  className?: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function Avatar({ name, src, className = '' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700 text-xs font-semibold text-content ${className}`}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}
