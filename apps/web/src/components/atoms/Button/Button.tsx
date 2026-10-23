import type { ComponentProps, ReactNode } from 'react'
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles.ts'

type ButtonProps = ComponentProps<'button'> & {
  icon?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

function hasWidth(className: string) {
  return /(^|\s)w-/.test(className)
}

export function Button({
  icon,
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const width = hasWidth(className) ? '' : 'w-full'

  return (
    <button
      type={type}
      className={buttonClassName(variant, `${width} ${className}`, size)}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
