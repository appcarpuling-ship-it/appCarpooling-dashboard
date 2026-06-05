import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import {
  Home, Users, Car, Calendar, CreditCard, MessageCircle, Bell,
  TrendingUp, Settings, LogOut, Menu, X, BarChart3, DollarSign,
  Image, Newspaper, Flag,
} from 'lucide-react'

const NAV = [
  { name: 'Dashboard',      href: '/',              icon: Home },
  { name: 'Estadísticas',   href: '/stats',          icon: BarChart3 },
  { name: 'Usuarios',       href: '/users',          icon: Users },
  { name: 'Viajes',         href: '/trips',          icon: Car },
  { name: 'Reservas',       href: '/bookings',       icon: Calendar },
  { name: 'Pagos',          href: '/payments',       icon: CreditCard },
  { name: 'Comisiones',     href: '/commissions',    icon: DollarSign },
  { name: 'Chat',           href: '/chat',           icon: MessageCircle },
  { name: 'Banners',        href: '/banners',        icon: Image },
  { name: 'Noticias',       href: '/news',           icon: Newspaper },
  { name: 'Reportes',       href: '/user-reports',   icon: Flag },
  { name: 'Notificaciones', href: '/notifications',  icon: Bell },
  { name: 'Análisis',       href: '/analytics',      icon: TrendingUp },
  { name: 'Configuración',  href: '/settings',       icon: Settings },
]

const Layout = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0"
               style={{ boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">Carpuling</span>
        </div>
        <button onClick={() => setOpen(false)}
          className="lg:hidden p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ name, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} to={href}
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              <Icon className="w-4.25 h-4.25 shrink-0" />
              <span>{name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.07] shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-indigo-500/25 flex items-center justify-center shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              : <span className="text-indigo-300 text-[11px] font-bold">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate leading-tight">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-400
                     hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-56 hidden lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 lg:hidden transform transition-transform duration-200 ease-out
                         ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </aside>

      {/* Content */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4 sticky top-0 z-40 shrink-0">
          <button onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          <div className="ml-auto text-[13px] text-slate-400 capitalize font-medium">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
             onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

export default Layout
