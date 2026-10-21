import { Icon } from '../../atoms/Icon/Icon.tsx'

type SocialButtonProps = {
  label: string
  iconSrc: string
  onClick?: () => void
}

export function SocialButton({ label, iconSrc, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded p-1 text-sm text-content hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon src={iconSrc} className="size-8 object-contain" />
      {label}
    </button>
  )
}
