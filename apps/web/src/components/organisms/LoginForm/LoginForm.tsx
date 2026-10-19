import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../atoms/Button/Button.tsx'
import { Checkbox } from '../../atoms/Checkbox/Checkbox.tsx'
import { Icon } from '../../atoms/Icon/Icon.tsx'
import { TextLink } from '../../atoms/TextLink/TextLink.tsx'
import { FormField } from '../../molecules/FormField/FormField.tsx'

export type LoginFormValues = {
  identifier: string
  password: string
  remember: boolean
}

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void
  forgotPasswordTo?: string
}

export function LoginForm({ onSubmit, forgotPasswordTo = '/esqueci-senha' }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ identifier, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        id="login-identifier"
        label="Email ou usuário"
        placeholder="usuario123"
        autoComplete="username"
        required
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />
      <FormField
        id="login-password"
        label="Senha"
        type="password"
        placeholder="******"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="flex items-center justify-between">
        <Checkbox
          label="Lembrar-me"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <TextLink to={forgotPasswordTo}>Esqueci a senha</TextLink>
      </div>
      <Button type="submit" className="mt-6" icon={<Icon src="/icons/arrow-forward.svg" />}>
        Login
      </Button>
    </form>
  )
}
