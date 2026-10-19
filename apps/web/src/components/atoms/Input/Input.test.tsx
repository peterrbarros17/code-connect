import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input.tsx'

it('recebe o texto digitado', async () => {
  const user = userEvent.setup()
  render(<Input aria-label="Email" />)
  const input = screen.getByRole('textbox', { name: 'Email' })
  await user.type(input, 'usuario123')
  expect(input).toHaveValue('usuario123')
})
