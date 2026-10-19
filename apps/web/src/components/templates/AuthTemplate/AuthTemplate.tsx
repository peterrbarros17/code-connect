import type { ReactNode } from 'react'
import { Heading } from '../../atoms/Heading/Heading.tsx'
import { Logo } from '../../atoms/Logo/Logo.tsx'

type AuthTemplateProps = {
  bannerSrc: string
  bannerAlt: string
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthTemplate({ bannerSrc, bannerAlt, title, subtitle, children }: AuthTemplateProps) {
  return (
    <main className="flex min-h-svh items-center justify-center p-4 md:p-8">
      <div className="flex w-full max-w-5xl flex-col gap-10 rounded-4xl bg-surface p-6 md:flex-row md:gap-16 md:p-16">
        <div className="relative hidden shrink-0 overflow-hidden md:block md:w-2/5">
          <img src={bannerSrc} alt={bannerAlt} className="absolute inset-0 size-full object-cover" />
          <Logo className="absolute bottom-8 left-1/2 -translate-x-1/2" />
        </div>
        <section className="flex w-full flex-col gap-8 md:max-w-sm">
          <Logo className="mx-auto md:hidden" />
          <header className="flex flex-col gap-6">
            <Heading level={1}>{title}</Heading>
            <Heading level={2}>{subtitle}</Heading>
          </header>
          {children}
        </section>
      </div>
    </main>
  )
}
