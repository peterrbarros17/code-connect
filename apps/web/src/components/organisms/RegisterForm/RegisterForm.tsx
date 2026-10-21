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
  onSubmit: (values: RegisterFormValues) => void
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ name, email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        id="register-name"
        label="Nome"
        placeholder="Nome completo"
        autoComplete="name"
        required
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
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <FormField
        id="register-password"
        label="Senha"
        type="password"
        placeholder="******"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" className="mt-6" icon={<Icon src="/icons/arrow-forward.svg" />}>
        Cadastrar
      </Button>
    </form>
  )
}
