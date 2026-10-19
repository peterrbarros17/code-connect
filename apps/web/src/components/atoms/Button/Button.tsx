import type { ComponentProps, ReactNode } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  icon?: ReactNode
}

export function Button({ icon, children, type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-3 text-lg font-semibold text-accent-dark transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
