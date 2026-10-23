// app/admin/layout.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package, LogOut, Home, Menu, X,
  ExternalLink, Calendar, ChevronDown, Star, Sandwich,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { 
    label: 'Pedidos', 
    icon: ShoppingBag, 
    href: '/admin/pedidos',
    children: [
      { label: 'Todos', href: '/admin/pedidos' },
      { label: 'Nuevos', href: '/admin/pedidos?estado=new' },
      { label: 'En preparación', href: '/admin/pedidos?estado=preparing' },
      { label: 'Listos', href: '/admin/pedidos?estado=ready' },
      { label: 'Historial', href: '/admin/pedidos?estado=history' },
    ]
  },
  { 
    label: 'Productos', 
    icon: Package, 
    href: '/admin/productos',
    children: [
      { label: 'Todos', href: '/admin/productos' },
      { label: 'Panes', href: '/admin/productos?categoria=Panes' },
      { label: 'Facturas', href: '/admin/productos?categoria=Facturas' },
      { label: 'Dulces', href: '/admin/productos?categoria=Dulces' },
      { label: 'Salados', href: '/admin/productos?categoria=Salados' },
      { label: 'Bocados calientes', href: '/admin/productos?categoria=Bocados calientes' },
    ]
  },
  { href: '/admin/destacados', label: 'Destacados', icon: Star },
  { href: '/admin/lunch', label: 'Lunch & Eventos', icon: Sandwich },
]

const woodSidebar = {
  backgroundImage:
    "linear-gradient(rgba(10,3,1,.72), rgba(10,3,1,.85)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const woodMain = {
  backgroundColor: '#150604',
  backgroundImage:
    "radial-gradient(circle at 15% 8%, rgba(201,169,110,.09), transparent 55%), radial-gradient(circle at 85% 92%, rgba(90,26,16,.22), transparent 60%), linear-gradient(rgba(10,3,1,.88), rgba(10,3,1,.92)), url('/images/textura-madera.png')",
  backgroundSize: 'cover, cover, cover, cover',
  backgroundPosition: 'center, center, center, center',
  backgroundAttachment: 'fixed',
}

const topbarStyle = {
  backgroundImage:
    "linear-gradient(rgba(10,3,1,.75), rgba(10,3,1,.85)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#150604] flex items-center justify-center text-white">Cargando panel...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  )
}

function AdminLayoutContent({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [today, setToday] = useState('')
  const [openMenus, setOpenMenus] = useState({})

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('es-AR', {
        weekday: 'long', day: '2-digit', month: 'long',
      })
    )
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [pathname, searchParams])

  useEffect(() => {
    if (pathname.startsWith('/admin/pedidos')) setOpenMenus(prev => ({ ...prev, 'Pedidos': true }))
    if (pathname.startsWith('/admin/productos')) setOpenMenus(prev => ({ ...prev, 'Productos': true }))
  }, [pathname])

  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    )
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isLinkActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    return currentUrl === href || (href === pathname && !searchParams.toString())
  }

  return (
    <div className="min-h-screen flex text-[#F5EDE3]" style={woodMain}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 flex flex-col fixed inset-y-0 left-0 border-r border-white/10 z-40 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={woodSidebar}
      >
        {/* Logo más grande, sin el texto "PANEL" */}
        <div className="px-5 py-6 border-b border-white/10 flex items-start justify-between gap-2 shrink-0">
          <Link href="/admin" className="block flex-1">
            <Image
              src="/images/logo-biarritz-blanco.png"
              alt="Biarritz"
              width={340}
              height={120}
              priority
              className="w-full h-auto max-h-32 object-contain mix-blend-screen"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-white/60 hover:text-white shrink-0 mt-1"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const hasChildren = link.children && link.children.length > 0
            const isOpen = openMenus[link.label]
            const isChildActive = hasChildren && link.children.some(child => isLinkActive(child.href))
            const isParentActive = hasChildren ? isChildActive : isLinkActive(link.href)

            return (
              <div key={link.label} className="mb-1">
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(link.label)}
                    className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all duration-200 border ${
                      isParentActive || isOpen
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isParentActive ? 'text-[#E0C89A]' : ''} />
                      <span className="font-medium text-sm">{link.label}</span>
                    </div>
                    <ChevronDown 
                      size={15} 
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#E0C89A]' : 'text-white/40'}`} 
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 border ${
                      isParentActive
                        ? 'bg-gradient-to-r from-[#E0C89A]/25 to-[#E0C89A]/10 border-[#E0C89A]/40 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.15)]'
                        : 'border-transparent text-white/70 hover:bg-white/8 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <Icon size={17} className={isParentActive ? 'text-[#E0C89A]' : 'group-hover:text-[#E0C89A] transition'} />
                    <span className="font-medium text-sm">{link.label}</span>
                  </Link>
                )}

                {hasChildren && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-10 pr-2 py-1 space-y-0.5 border-l border-white/10 ml-5">
                      {link.children.map((child) => {
                        const childActive = isLinkActive(child.href)
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={`block px-3 py-1.5 rounded-md text-xs transition-colors ${
                              childActive
                                ? 'text-[#E0C89A] font-semibold bg-white/5'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-white/70 hover:bg-white/8 hover:text-white transition text-sm"
          >
            <Home size={16} />
            <span className="font-medium">Ver tienda</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-white/70 hover:bg-red-500/15 hover:text-red-200 transition text-sm"
          >
            <LogOut size={16} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 w-full overflow-hidden md:ml-72 flex flex-col min-h-screen">
        <header
          className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl shrink-0"
          style={topbarStyle}
        >
          <div className="h-14 px-4 md:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-white/70 hover:text-white shrink-0"
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#E0C89A]">Admin</p>
                <h2 className="font-serif text-base text-white leading-tight capitalize truncate">
                  {pathname.includes('/pedidos') ? 'Pedidos' : pathname.includes('/productos') ? 'Productos' : 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {today && (
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/60 border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                  <Calendar size={11} />
                  <span className="capitalize">{today}</span>
                </div>
              )}
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-2 text-[11px] text-white/80 hover:text-white border border-white/20 bg-white/8 px-3 py-1 rounded-full transition"
              >
                <ExternalLink size={11} />
                Tienda
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 relative z-10 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}