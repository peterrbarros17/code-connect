import { Link, NavLink, useNavigate } from 'react-router'
import { buttonClassName } from '../../atoms/Button/buttonStyles.ts'
import { Icon } from '../../atoms/Icon/Icon.tsx'
import { Logo } from '../../atoms/Logo/Logo.tsx'
import { icons } from '../../../constants/icons.ts'
import { useAuth } from '../../../contexts/auth-context.ts'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded px-2 py-2 text-base transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    isActive ? 'text-accent' : 'text-content-muted hover:text-content'
  }`
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="hidden rounded-lg bg-surface px-4 py-10 lg:flex lg:w-44 lg:shrink-0 lg:flex-col lg:items-center lg:gap-16">
      <Link
        to="/"
        aria-label="Ir para o feed"
        className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Logo />
      </Link>

      <div className="flex w-full flex-col gap-10">
        {user && (
          <Link to="/publicar" className={buttonClassName('outline', 'w-full', 'sm')}>
            Publicar
          </Link>
        )}

        <nav aria-label="Principal" className="flex flex-col gap-3">
          <NavLink to="/" end className={navLinkClass}>
            <Icon src={icons.feed} className="size-5" />
            Feed
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto w-full">
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded px-2 py-2 text-base text-content-muted transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Icon src={icons.logout} className="size-5" />
            Sair
          </button>
        ) : (
          <Link
            to="/login"
            className="flex w-full items-center gap-3 rounded px-2 py-2 text-base text-content-muted transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Icon src={icons.login} className="size-5" />
            Entrar
          </Link>
        )}
      </div>
    </aside>
  )
}
