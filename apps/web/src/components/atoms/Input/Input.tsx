import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded bg-field px-4 py-2.5 text-base text-field-text placeholder:text-field-text focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      {...props}
    />
  )
}
