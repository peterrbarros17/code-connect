import { render, screen } from '@testing-library/react'
import { Logo } from './Logo.tsx'

it('renderiza o logo com nome acessível', () => {
  render(<Logo />)
  expect(screen.getByRole('img', { name: 'Code Connect' })).toBeInTheDocument()
})
