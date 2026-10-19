import type { ComponentProps } from 'react'
import { Input } from '../../atoms/Input/Input.tsx'
import { Label } from '../../atoms/Label/Label.tsx'

type FormFieldProps = ComponentProps<'input'> & {
  id: string
  label: string
}

export function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}
