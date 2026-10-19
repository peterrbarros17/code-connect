import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from './FormField.tsx'

it('liga o rótulo ao campo e recebe digitação', async () => {
  const user = userEvent.setup()
  render(<FormField id="email" label="Email ou usuário" placeholder="usuario123" />)
  const input = screen.getByLabelText('Email ou usuário')
  await user.type(input, 'ana')
  expect(input).toHaveValue('ana')
})
