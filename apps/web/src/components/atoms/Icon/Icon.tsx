type IconProps = {
  src: string
  alt?: string
  className?: string
}

export function Icon({ src, alt = '', className = 'size-4' }: IconProps) {
  return <img src={src} alt={alt} aria-hidden={alt === '' ? true : undefined} className={className} />
}
