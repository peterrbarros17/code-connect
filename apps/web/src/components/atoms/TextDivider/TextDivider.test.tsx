import { render, screen } from '@testing-library/react'
import { TextDivider } from './TextDivider.tsx'

it('renderiza o separador com o texto', () => {
  render(<TextDivider text="ou entre com outras contas" />)
  expect(screen.getByRole('separator', { name: 'ou entre com outras contas' })).toBeInTheDocument()
  expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
})
