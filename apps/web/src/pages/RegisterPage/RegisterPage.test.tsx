import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../../contexts/AuthProvider.tsx'
import { login, register } from '../../services/auth.ts'
import { RegisterPage } from './RegisterPage.tsx'

vi.mock('../../services/auth.ts', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

const loginMock = vi.mocked(login)
const registerMock = vi.mocked(register)

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function renderRegisterPage() {
  render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <AuthProvider>
        <Routes>
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/" element={<h1>Início</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

it('renderiza a tela de cadastro', () => {
  renderRegisterPage()
  expect(screen.getByRole('heading', { level: 1, name: 'Cadastro' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
})

it('cadastra o usuário e entra na conta', async () => {
  const user = userEvent.setup()
  registerMock.mockResolvedValue({
    id: '1',
    name: 'Ana Souza',
    email: 'ana@email.com',
    createdAt: '2026-10-21T18:00:00.000Z',
  })
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

  renderRegisterPage()
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('Email'), 'ana@email.com')
  await user.type(screen.getByLabelText('Senha'), 'segredo123')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

  expect(await screen.findByRole('heading', { name: 'Início' })).toBeInTheDocument()
  expect(registerMock).toHaveBeenCalledWith({
    name: 'Ana Souza',
    email: 'ana@email.com',
    password: 'segredo123',
  })
  expect(loginMock).toHaveBeenCalledWith({ email: 'ana@email.com', password: 'segredo123' })
})

it('mostra a mensagem devolvida pela API quando o cadastro falha', async () => {
  const user = userEvent.setup()
  registerMock.mockRejectedValue(new Error('Já existe um usuário com este e-mail.'))

  renderRegisterPage()
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('Email'), 'ana@email.com')
  await user.type(screen.getByLabelText('Senha'), 'segredo123')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Já existe um usuário com este e-mail.',
  )
})
