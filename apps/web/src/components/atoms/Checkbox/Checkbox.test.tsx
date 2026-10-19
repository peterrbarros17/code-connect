import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox.tsx'

it('marca ao clique no rótulo', async () => {
  const user = userEvent.setup()
  render(<Checkbox label="Lembrar-me" />)
  await user.click(screen.getByText('Lembrar-me'))
  expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked()
})
