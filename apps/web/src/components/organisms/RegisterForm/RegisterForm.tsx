import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../atoms/Button/Button.tsx'
import { Icon } from '../../atoms/Icon/Icon.tsx'
import { FormField } from '../../molecules/FormField/FormField.tsx'

export type RegisterFormValues = {
  name: string
  email: string
  password: string
}

type RegisterFormProps = {
  onSubmit: (values: RegisterFormValues) => void | Promise<void>
  isSubmitting?: boolean
}

export function RegisterForm({ onSubmit, isSubmitting = false }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit({ name, email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        id="register-name"
        label="Nome"
        placeholder="Nome completo"
        autoComplete="name"
        required
        disabled={isSubmitting}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <FormField
        id="register-email"
        label="Email"
        type="email"
        placeholder="Digite seu email"
        autoComplete="email"
        required
        disabled={isSubmitting}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <FormField
        id="register-password"
        label="Senha"
        type="password"
        placeholder="******"
        autoComplete="new-password"
        minLength={8}
        required
        disabled={isSubmitting}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button
        type="submit"
        className="mt-6"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        icon={<Icon src="/icons/arrow-forward.svg" />}
      >
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  )
}
