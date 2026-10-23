import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../contexts/auth-context.ts'
import type { AuthContextValue } from '../../contexts/auth-context.ts'
import { createComment, getPost } from '../../services/posts.ts'
import type { PostDetail } from '../../types/posts.ts'
import { PostDetailPage } from './PostDetailPage.tsx'

vi.mock('../../services/posts.ts', () => ({
  createComment: vi.fn(),
  getPost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

const detail: PostDetail = {
  id: 'post-1',
  title: 'Como organizar componentes React',
  content: 'Um guia prático para separar responsabilidades no projeto.',
  code: null,
  thumbnailUrl: '/posts/post-01.png',
  tags: ['react', 'front-end'],
  author: { id: 'user-1', name: 'Bia Nogueira' },
  createdAt: '2026-10-21T18:00:00.000Z',
  likesCount: 2,
  commentsCount: 2,
  likedByMe: false,
  comments: [
    {
      id: 'comment-1',
      postId: 'post-1',
      parentId: null,
      content: 'Gostei muito da explicação.',
      author: { id: 'user-2', name: 'Caio Martins' },
      createdAt: '2026-10-21T19:00:00.000Z',
    },
    {
      id: 'comment-2',
      postId: 'post-1',
      parentId: 'comment-1',
      content: 'Também achei!',
      author: { id: 'user-1', name: 'Bia Nogueira' },
      createdAt: '2026-10-21T19:20:00.000Z',
    },
  ],
}

const user = {
  id: 'user-1',
  name: 'Bia Nogueira',
  email: 'bia@codeconnect.dev',
  createdAt: '2026-10-01T12:00:00.000Z',
}

const anonymousAuth: AuthContextValue = {
  user: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
}

const loggedAuth: AuthContextValue = {
  ...anonymousAuth,
  user,
}

function renderDetail(auth: AuthContextValue = anonymousAuth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/posts/post-1']}>
        <Routes>
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/login" element={<p>Página de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getPost).mockResolvedValue(detail)
})

it('mostra o post, as respostas e o convite de login', async () => {
  renderDetail()

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Como organizar componentes React',
    }),
  ).toBeVisible()
  expect(screen.getByText('Comentários (2)')).toBeInTheDocument()
  expect(screen.getByText('Gostei muito da explicação.')).toBeInTheDocument()
  expect(screen.getByText('Também achei!')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Entre' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Comentar' })).not.toBeInTheDocument()
})

it('adiciona um comentário quando a sessão existe', async () => {
  const browserUser = userEvent.setup()
  vi.mocked(createComment).mockResolvedValue({
    id: 'comment-3',
    postId: 'post-1',
    parentId: null,
    content: 'Comentário novo',
    author: { id: user.id, name: user.name },
    createdAt: '2026-10-21T20:00:00.000Z',
  })

  renderDetail(loggedAuth)

  await screen.findByRole('heading', {
    level: 1,
    name: 'Como organizar componentes React',
  })

  await browserUser.type(
    screen.getByLabelText('Escreva um comentário'),
    'Comentário novo',
  )
  await browserUser.click(screen.getByRole('button', { name: 'Comentar' }))

  expect(await screen.findByText('Comentário novo')).toBeInTheDocument()
  expect(screen.getByText('Comentários (3)')).toBeInTheDocument()
  expect(createComment).toHaveBeenCalledWith('post-1', {
    content: 'Comentário novo',
    parentId: undefined,
  })
})
