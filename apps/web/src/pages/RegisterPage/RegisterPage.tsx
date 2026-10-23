import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { AuthSwitch } from '../../components/molecules/AuthSwitch/AuthSwitch.tsx'
import { RegisterForm } from '../../components/organisms/RegisterForm/RegisterForm.tsx'
import type { RegisterFormValues } from '../../components/organisms/RegisterForm/RegisterForm.tsx'
import { SocialLogin } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import type { SocialProvider } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate.tsx'
import { useAuth } from '../../contexts/auth-context.ts'
import { getErrorMessage } from '../../services/api.ts'

export function RegisterPage() {
  const { user, register } = useAuth()
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

  async function handleRegister(values: RegisterFormValues) {
    setError(null)
    setIsSubmitting(true)

    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      navigate(returnTo, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Não foi possível concluir o cadastro.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleProvider(provider: SocialProvider) {
    console.log('register social', provider)
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-cadastro.png"
      bannerAlt="Desenvolvedora sorrindo enquanto programa"
      title="Cadastro"
      subtitle="Olá! Preencha seus dados."
    >
      {error && (
        <p role="alert" className="rounded bg-page px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} />
      <SocialLogin onProviderClick={handleProvider} />
      <AuthSwitch
        question="Já tem conta?"
        linkLabel="Faça seu login!"
        to="/login"
        iconSrc="/icons/login.svg"
      />
    </AuthTemplate>
  )
}
