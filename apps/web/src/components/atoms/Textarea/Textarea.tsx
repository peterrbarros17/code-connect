import type { ComponentProps } from 'react'

export function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={`min-h-28 w-full resize-y rounded bg-field px-4 py-2.5 text-base text-field-text placeholder:text-field-text focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      {...props}
    />
  )
}
