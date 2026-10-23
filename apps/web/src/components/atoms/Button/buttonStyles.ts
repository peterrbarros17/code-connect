export type ButtonVariant = 'primary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export const baseButtonStyles =
  'flex items-center justify-center gap-2 rounded font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60'

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-contrast hover:brightness-90',
  outline: 'border border-accent bg-transparent text-accent hover:bg-accent/10',
  ghost: 'bg-transparent text-content-muted hover:text-accent',
}

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-base',
  md: 'px-4 py-3 text-lg',
}

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  className = '',
  size: ButtonSize = 'md',
) {
  return `${baseButtonStyles} ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`
}
