import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button.tsx'

it('dispara a ação ao clique', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(<Button onClick={onClick}>Login</Button>)
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(onClick).toHaveBeenCalledOnce()
})
