import { fireEvent, render, screen } from '@testing-library/react'
import { API_URL } from '../../../services/api.ts'
import { PostThumbnail } from './PostThumbnail.tsx'

it('usa o placeholder quando o post não tem miniatura', () => {
  render(<PostThumbnail src={null} alt="Miniatura do post" />)

  expect(screen.getByRole('img', { name: 'Miniatura do post' })).toHaveAttribute(
    'src',
    '/posts/placeholder.png',
  )
})

it('troca para o placeholder quando a imagem falha', () => {
  render(<PostThumbnail src="/posts/post-01.png" alt="Miniatura do post" />)

  const image = screen.getByRole('img', { name: 'Miniatura do post' })
  expect(image).toHaveAttribute('src', '/posts/post-01.png')

  fireEvent.error(image)

  expect(image).toHaveAttribute('src', '/posts/placeholder.png')
})

it('prefixa a URL da API em miniaturas enviadas', () => {
  render(
    <PostThumbnail
      src="/uploads/posts/arquivo.png"
      alt="Miniatura enviada"
    />,
  )

  expect(screen.getByRole('img', { name: 'Miniatura enviada' })).toHaveAttribute(
    'src',
    `${API_URL}/uploads/posts/arquivo.png`,
  )
})
