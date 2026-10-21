import { AuthSwitch } from '../../components/molecules/AuthSwitch/AuthSwitch.tsx'
import { RegisterForm } from '../../components/organisms/RegisterForm/RegisterForm.tsx'
import type { RegisterFormValues } from '../../components/organisms/RegisterForm/RegisterForm.tsx'
import { SocialLogin } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import type { SocialProvider } from '../../components/organisms/SocialLogin/SocialLogin.tsx'
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate.tsx'

export function RegisterPage() {
  function handleRegister(values: RegisterFormValues) {
    console.log('register', values)
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
      <RegisterForm onSubmit={handleRegister} />
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
