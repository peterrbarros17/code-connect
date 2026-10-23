import { Outlet } from 'react-router'
import { MobileNav } from '../../organisms/MobileNav/MobileNav.tsx'
import { Sidebar } from '../../organisms/Sidebar/Sidebar.tsx'

export function MainLayout() {
  return (
    <div className="min-h-svh pb-24 lg:pb-0">
      <a
        href="#conteudo"
        className="sr-only rounded bg-accent px-4 py-2 text-accent-contrast focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-7 lg:py-14">
        <Sidebar />
        <main id="conteudo" className="min-w-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
