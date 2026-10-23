import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../../contexts/AuthProvider.tsx'
import { login } from '../../services/auth.ts'
import { LoginPage } from './LoginPage.tsx'

vi.mock('../../services/auth.ts', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

const loginMock = vi.mocked(login)

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function renderLoginPage() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Início</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

it('renderiza a tela de login', () => {
  renderLoginPage()
  expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
})

it('autentica e guarda a sessão', async () => {
  const user = userEvent.setup()
  loginMock.mockResolvedValue({
    access_token: 'token-de-teste',
    token_type: 'Bearer',
    expires_in: 3600,
    user: {
      id: '1',
      name: 'Ana Souza',
      email: 'ana@email.com',
      createdAt: '2026-10-21T18:00:00.000Z',
    },
  })

  renderLoginPage()
  await user.type(screen.getByLabelText('Email'), 'ana@email.com')
  await user.type(screen.getByLabelText('Senha'), 'segredo123')
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(await screen.findByRole('heading', { name: 'Início' })).toBeInTheDocument()
  expect(loginMock).toHaveBeenCalledWith({ email: 'ana@email.com', password: 'segredo123' })
  expect(localStorage.getItem('code-connect:access-token')).toBe('token-de-teste')
})

it('mostra a mensagem devolvida pela API quando o login falha', async () => {
  const user = userEvent.setup()
  loginMock.mockRejectedValue(new Error('Credenciais inválidas.'))

  renderLoginPage()
  await user.type(screen.getByLabelText('Email'), 'ana@email.com')
  await user.type(screen.getByLabelText('Senha'), 'senha-errada')
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas.')
})
