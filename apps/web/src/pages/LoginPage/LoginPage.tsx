import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { AuthSwitch } from '../../components/molecules/AuthSwitch/AuthSwitch.tsx'
import { LoginForm } from '../../components/organisms/LoginForm/LoginForm.tsx'
import type { LoginFormValues } from '../../components/organisms/LoginForm/LoginForm.tsx'
import { SocialLogin } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import type { SocialProvider } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate.tsx'
import { useAuth } from '../../contexts/auth-context.ts'
import { getErrorMessage } from '../../services/api.ts'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const state = location.state as { from?: unknown } | null
  const returnTo =
    typeof state?.from === 'string' && state.from.startsWith('/')
      ? state.from
      : '/'

  if (user) {
    return <Navigate to={returnTo} replace />
  }

  async function handleLogin(values: LoginFormValues) {
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email: values.identifier.trim(), password: values.password })
      navigate(returnTo, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Não foi possível entrar. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleProvider(provider: SocialProvider) {
    console.log('login social', provider)
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-login.png"
      bannerAlt="Desenvolvedora sorrindo enquanto programa"
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
    >
      {error && (
        <p role="alert" className="rounded bg-page px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
      <SocialLogin onProviderClick={handleProvider} />
      <AuthSwitch
        question="Ainda não tem conta?"
        linkLabel="Crie seu cadastro!"
        to="/cadastro"
        iconSrc="/icons/assignment.svg"
      />
    </AuthTemplate>
  )
}
