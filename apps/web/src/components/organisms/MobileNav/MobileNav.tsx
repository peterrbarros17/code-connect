import { NavLink, useNavigate } from 'react-router'
import { Icon } from '../../atoms/Icon/Icon.tsx'
import { icons } from '../../../constants/icons.ts'
import { useAuth } from '../../../contexts/auth-context.ts'

function itemClass({ isActive }: { isActive: boolean }) {
  return `flex flex-1 flex-col items-center gap-1 rounded px-2 py-2 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    isActive ? 'text-accent' : 'text-content-muted hover:text-content'
  }`
}

export function MobileNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-800 bg-surface px-4 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-3xl items-stretch">
        <NavLink to="/" end className={itemClass}>
          <Icon src={icons.feed} className="size-6" />
          Feed
        </NavLink>

        {user && (
          <NavLink to="/publicar" className={itemClass}>
            <Icon src={icons.assignment} className="size-6" />
            Publicar
          </NavLink>
        )}

        {user ? (
          <button type="button" onClick={handleLogout} className={itemClass({ isActive: false })}>
            <Icon src={icons.logout} className="size-6" />
            Sair
          </button>
        ) : (
          <NavLink to="/login" className={itemClass}>
            <Icon src={icons.login} className="size-6" />
            Entrar
          </NavLink>
        )}
      </div>
    </nav>
  )
}
