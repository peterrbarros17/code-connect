import { render, screen } from '@testing-library/react'
import { AuthTemplate } from './AuthTemplate.tsx'

it('renderiza banner, títulos e conteúdo', () => {
  render(
    <AuthTemplate bannerSrc="/banner.png" bannerAlt="Pessoa programando" title="Login" subtitle="Boas-vindas!">
      <p>conteúdo do formulário</p>
    </AuthTemplate>,
  )
  expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: 'Boas-vindas!' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Pessoa programando' })).toHaveAttribute('src', '/banner.png')
  expect(screen.getByText('conteúdo do formulário')).toBeInTheDocument()
})
