import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './RegisterForm.tsx'

it('envia os valores digitados', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  render(<RegisterForm onSubmit={onSubmit} />)
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('Email'), 'ana@email.com')
  await user.type(screen.getByLabelText('Senha'), 'segredo123')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'Ana Souza',
    email: 'ana@email.com',
    password: 'segredo123',
  })
})

it('bloqueia o envio enquanto a requisição está em andamento', () => {
  render(<RegisterForm onSubmit={vi.fn()} isSubmitting />)
  expect(screen.getByRole('button', { name: 'Cadastrando...' })).toBeDisabled()
  expect(screen.getByLabelText('Nome')).toBeDisabled()
})
