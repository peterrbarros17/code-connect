import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SocialLogin } from './SocialLogin.tsx'

it('informa o provedor escolhido', async () => {
  const user = userEvent.setup()
  const onProviderClick = vi.fn()
  render(<SocialLogin onProviderClick={onProviderClick} />)
  await user.click(screen.getByRole('button', { name: 'Gmail' }))
  expect(onProviderClick).toHaveBeenCalledWith('gmail')
})
