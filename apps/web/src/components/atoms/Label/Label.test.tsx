import { render, screen } from '@testing-library/react'
import { Label } from './Label.tsx'

it('associa o texto ao campo', () => {
  render(
    <>
      <Label htmlFor="senha">Senha</Label>
      <input id="senha" />
    </>,
  )
  expect(screen.getByLabelText('Senha')).toBeInTheDocument()
})
