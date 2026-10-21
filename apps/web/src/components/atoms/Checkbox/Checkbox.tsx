import type { ComponentProps } from 'react'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 text-base text-content-muted ${className}`}>
      <span className="relative flex size-6 items-center justify-center">
        <input
          type="checkbox"
          className="peer size-full cursor-pointer appearance-none rounded border-2 border-field focus-visible:outline-2 focus-visible:outline-accent"
          {...props}
        />
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute hidden size-4 fill-none stroke-accent stroke-3 peer-checked:block"
        >
          <path d="M4 12l5 5L20 6" />
        </svg>
      </span>
      {label}
    </label>
  )
}
