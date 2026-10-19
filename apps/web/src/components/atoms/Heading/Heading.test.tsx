import { render, screen } from '@testing-library/react'
import { Heading } from './Heading.tsx'

it('renderiza o título no nível pedido', () => {
  render(<Heading level={2}>Boas-vindas!</Heading>)
  expect(screen.getByRole('heading', { level: 2, name: 'Boas-vindas!' })).toBeInTheDocument()
})
