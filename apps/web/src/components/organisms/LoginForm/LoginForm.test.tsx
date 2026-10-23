import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LoginForm } from './LoginForm.tsx'

it('envia os valores digitados', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  render(
    <MemoryRouter>
      <LoginForm onSubmit={onSubmit} />
    </MemoryRouter>,
  )
  await user.type(screen.getByLabelText('Email'), 'usuario@email.com')
  await user.type(screen.getByLabelText('Senha'), 'segredo')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(onSubmit).toHaveBeenCalledWith({
    identifier: 'usuario@email.com',
    password: 'segredo',
    remember: true,
  })
})

it('bloqueia o envio enquanto a requisição está em andamento', () => {
  render(
    <MemoryRouter>
      <LoginForm onSubmit={vi.fn()} isSubmitting />
    </MemoryRouter>,
  )
  expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
  expect(screen.getByLabelText('Email')).toBeDisabled()
})
