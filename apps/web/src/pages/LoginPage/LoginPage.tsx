import { AuthSwitch } from '../../components/molecules/AuthSwitch/AuthSwitch.tsx'
import { LoginForm } from '../../components/organisms/LoginForm/LoginForm.tsx'
import type { LoginFormValues } from '../../components/organisms/LoginForm/LoginForm.tsx'
import { SocialLogin } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import type { SocialProvider } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate.tsx'

export function LoginPage() {
  function handleLogin(values: LoginFormValues) {
    console.log('login', values)
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
      <LoginForm onSubmit={handleLogin} />
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
