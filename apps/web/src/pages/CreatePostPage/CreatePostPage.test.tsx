import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../contexts/auth-context.ts'
import type { AuthContextValue } from '../../contexts/auth-context.ts'
import { createPost, uploadPostThumbnail } from '../../services/posts.ts'
import type { PostDetail } from '../../types/posts.ts'
import { CreatePostPage } from './CreatePostPage.tsx'

vi.mock('../../services/posts.ts', () => ({
  createPost: vi.fn(),
  uploadPostThumbnail: vi.fn(),
}))

const user = {
  id: 'user-1',
  name: 'Bia Nogueira',
  email: 'bia@codeconnect.dev',
  createdAt: '2026-10-01T12:00:00.000Z',
}

const auth: AuthContextValue = {
  user,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
}

const anonymousAuth: AuthContextValue = {
  ...auth,
  user: null,
}

function renderPage(value: AuthContextValue = auth) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/publicar']}>
        <Routes>
          <Route path="/publicar" element={<CreatePostPage />} />
          <Route path="/login" element={<p>Página de login</p>} />
          <Route path="/posts/:postId" element={<p>Post criado</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createPost).mockResolvedValue({ id: 'post-novo' } as PostDetail)
})

it('redireciona para o login quando não há sessão', async () => {
  renderPage(anonymousAuth)

  expect(await screen.findByText('Página de login')).toBeInTheDocument()
})

it('publica o post e navega para o detalhe', async () => {
  const browserUser = userEvent.setup()
  renderPage()

  await browserUser.type(
    screen.getByLabelText('Nome do post'),
    'Meu primeiro post',
  )
  await browserUser.type(
    screen.getByLabelText('Descrição'),
    'Um texto com mais de dez caracteres para validar o formulário.',
  )
  await browserUser.type(screen.getByLabelText('Tags'), 'React')
  await browserUser.click(screen.getByRole('button', { name: 'Adicionar' }))
  await browserUser.click(screen.getByRole('button', { name: 'Publicar' }))

  expect(await screen.findByText('Post criado')).toBeInTheDocument()
  expect(createPost).toHaveBeenCalledWith({
    title: 'Meu primeiro post',
    content: 'Um texto com mais de dez caracteres para validar o formulário.',
    code: undefined,
    thumbnailUrl: undefined,
    tags: ['react'],
  })
  expect(uploadPostThumbnail).not.toHaveBeenCalled()
})
