import { render, screen } from '@testing-library/react'
import { Icon } from './Icon.tsx'

it('renderiza o ícone com texto alternativo', () => {
  render(<Icon src="/github.png" alt="Github" />)
  expect(screen.getByRole('img', { name: 'Github' })).toHaveAttribute('src', '/github.png')
})
