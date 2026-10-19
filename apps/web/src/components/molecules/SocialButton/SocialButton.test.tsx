import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SocialButton } from './SocialButton.tsx'

it('dispara a ação ao clique', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(<SocialButton label="Github" iconSrc="/github.png" onClick={onClick} />)
  await user.click(screen.getByRole('button', { name: 'Github' }))
  expect(onClick).toHaveBeenCalledOnce()
})
