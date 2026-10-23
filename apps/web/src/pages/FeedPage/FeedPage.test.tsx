import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../contexts/auth-context.ts'
import type { AuthContextValue } from '../../contexts/auth-context.ts'
import { getPostTags, likePost, listPosts } from '../../services/posts.ts'
import type { Post, PostListResponse } from '../../types/posts.ts'
import { FeedPage } from './FeedPage.tsx'

vi.mock('../../services/posts.ts', () => ({
  getPostTags: vi.fn(),
  likePost: vi.fn(),
  listPosts: vi.fn(),
  unlikePost: vi.fn(),
}))

const post: Post = {
  id: 'post-1',
  title: 'Como organizar componentes React',
  content: 'Um guia prático para separar responsabilidades no projeto.',
  code: null,
  thumbnailUrl: '/posts/post-01.png',
  tags: ['react', 'front-end'],
  author: { id: 'user-1', name: 'Bia Nogueira' },
  createdAt: '2026-10-21T18:00:00.000Z',
  likesCount: 2,
  commentsCount: 1,
  likedByMe: false,
}

const response: PostListResponse = {
  items: [post],
  total: 1,
  page: 1,
  limit: 50,
  totalPages: 1,
}

const anonymousAuth: AuthContextValue = {
  user: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
}

function renderFeed(auth: AuthContextValue = anonymousAuth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/login" element={<p>Página de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  vi.mocked(getPostTags).mockResolvedValue([
    { tag: 'react', count: 1 },
    { tag: 'front-end', count: 1 },
  ])
  vi.mocked(listPosts).mockResolvedValue(response)
})

it('carrega e mostra os posts do feed', async () => {
  renderFeed()

  expect(
    await screen.findByRole('heading', {
      name: 'Como organizar componentes React',
    }),
  ).toBeVisible()
  expect(screen.getByText(/1 posts encontrados/)).toBeInTheDocument()
  expect(screen.getByText('Bia Nogueira')).toBeInTheDocument()

  await waitFor(() =>
    expect(listPosts).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'recent', limit: 50 }),
    ),
  )
})

it('manda quem não está logado para o login ao curtir', async () => {
  const user = userEvent.setup()
  renderFeed()

  const likeButton = await screen.findByRole('button', {
    name: 'Curtir este post',
  })
  await user.click(likeButton)

  expect(await screen.findByText('Página de login')).toBeInTheDocument()
  expect(likePost).not.toHaveBeenCalled()
})

it('envia a busca com debounce para a API', async () => {
  const user = userEvent.setup()
  renderFeed()

  await screen.findByRole('heading', {
    name: 'Como organizar componentes React',
  })

  await user.type(
    screen.getByRole('searchbox', { name: 'Buscar posts' }),
    'react',
  )

  await waitFor(
    () =>
      expect(listPosts).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'react' }),
      ),
    { timeout: 1500 },
  )
})

it('filtra por tag no backend ao clicar em uma sugestão', async () => {
  const user = userEvent.setup()
  renderFeed()

  await screen.findByRole('heading', {
    name: 'Como organizar componentes React',
  })

  await user.click(screen.getByRole('button', { name: 'React' }))

  await waitFor(() =>
    expect(listPosts).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: ['react'] }),
    ),
  )
})
