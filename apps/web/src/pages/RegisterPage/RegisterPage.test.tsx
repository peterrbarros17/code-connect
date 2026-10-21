import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { RegisterPage } from './RegisterPage.tsx'

it('renderiza a tela de cadastro', () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1, name: 'Cadastro' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
})
