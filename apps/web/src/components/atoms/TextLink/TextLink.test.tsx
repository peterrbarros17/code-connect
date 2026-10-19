import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { TextLink } from './TextLink.tsx'

it('aponta para o destino', () => {
  render(
    <MemoryRouter>
      <TextLink to="/esqueci-senha">Esqueci a senha</TextLink>
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toHaveAttribute('href', '/esqueci-senha')
})
