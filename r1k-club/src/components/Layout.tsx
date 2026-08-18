import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { pageview } from '@/lib/analytics'
import { isConfigured } from '@/lib/env'

const NAV = [
  { to: '/ranking', label: 'Ranking' },
  { to: '/dashboard', label: 'Minha conta' },
]

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    pageview(location.pathname)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      {!isConfigured && <DemoBanner />}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function DemoBanner() {
  return (
    <div className="bg-gold-300/10 px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-gold-200">
      Modo demonstração — dados de exemplo. Configure o Supabase para ativar o checkout.
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          className="focus-gold font-display text-lg font-bold tracking-tight text-gold-foil"
        >
          R$1K CLUB
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `focus-gold rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors ${
                  isActive ? 'text-gold-200' : 'text-white/45 hover:text-white/75'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/checkout"
            className="focus-gold ml-2 rounded-full bg-gold-sheen bg-[length:200%_auto] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-950 transition-all hover:bg-[position:100%_center]"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} R$1K CLUB — uma experiência de status digital.
        </p>
        <div className="flex gap-5 text-xs text-white/30">
          <Link to="/ranking" className="focus-gold hover:text-white/60">
            Ranking
          </Link>
          <Link to="/termos" className="focus-gold hover:text-white/60">
            Termos
          </Link>
          <Link to="/privacidade" className="focus-gold hover:text-white/60">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
