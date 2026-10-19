import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthSwitch } from './AuthSwitch.tsx'

it('mostra a pergunta e o link de troca', () => {
  render(
    <MemoryRouter>
      <AuthSwitch question="Ainda não tem conta?" linkLabel="Crie seu cadastro!" to="/cadastro" />
    </MemoryRouter>,
  )
  expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
})
