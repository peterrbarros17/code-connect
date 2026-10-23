import { useId, useState } from 'react'
import { Button } from '../../atoms/Button/Button.tsx'
import { Textarea } from '../../atoms/Textarea/Textarea.tsx'

type CommentFormProps = {
  label: string
  placeholder: string
  submitLabel: string
  isSubmitting: boolean
  onSubmit: (content: string) => Promise<void> | void
  onCancel?: () => void
  autoFocus?: boolean
}

export function CommentForm({
  label,
  placeholder,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const id = useId()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = content.trim()

    if (trimmed.length === 0) {
      setError('Escreva um comentário antes de enviar.')
      return
    }

    setError(null)

    try {
      await onSubmit(trimmed)
      setContent('')
    } catch {
      // O erro da API é exibido pela página que controla o formulário.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm font-medium text-content">
        {label}
      </label>
      <Textarea
        id={id}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        autoFocus={autoFocus}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            size="sm"
            className="w-auto"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm"
          className="w-auto px-6"
        >
          {isSubmitting ? 'Enviando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
