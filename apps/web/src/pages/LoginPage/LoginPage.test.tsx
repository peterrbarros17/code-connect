import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LoginPage } from './LoginPage.tsx'

it('renderiza a tela de login', () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
})
