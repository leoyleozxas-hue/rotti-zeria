// app/admin/layout.jsx
//
// Shell del panel: sidebar de madera con navegación agrupada, topbar sticky con
// el título real de la ruta y un único punto de foco visible (`.admin-scope`).

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Home,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'
import { ADMIN_NAV, titleForPath } from '@/lib/constants/nav'

const woodSidebar = {
  backgroundImage:
    "linear-gradient(rgba(10,3,1,.72), rgba(10,3,1,.85)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const woodMain = {
  backgroundColor: 'var(--color-ink-950)',
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-white/50">
          Cargando panel…
        </div>
      }
    >
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
  // Sólo guarda overrides explícitos del usuario; si no hay, el grupo se abre
  // según la ruta (estado derivado, sin efecto).
  const [openMenus, setOpenMenus] = useState({})

  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

  // La fecha se calcula en el cliente: la del servidor puede estar en otra zona
  // horaria y romper la hidratación. Se difiere un tick para no bloquear el
  // primer render.
  useEffect(() => {
    const id = setTimeout(() => {
      setToday(
        new Date().toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })
      )
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const activeGroup = pathname.startsWith('/admin/pedidos')
    ? 'Pedidos'
    : pathname.startsWith('/admin/productos')
      ? 'Productos'
      : null

  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    )
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href) => {
    if (!href) return false
    if (href === '/admin') return pathname === '/admin'
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    return query ? currentUrl === href : !searchParams.toString()
  }

  return (
    <div className="admin-scope flex min-h-screen text-cream" style={woodMain}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={woodSidebar}
        aria-label="Navegación del panel"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="block flex-1">
            <Image
              src="/images/logo-biarritz-blanco.png"
              alt="Biarritz"
              width={340}
              height={120}
              priority
              className="h-auto max-h-24 w-full object-contain mix-blend-screen"
            />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="mt-1 shrink-0 rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((section) => (
            <div key={section.group}>
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold-soft/50">
                {section.group}
              </p>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const hasChildren = item.children?.length > 0
                  const isOpen = openMenus[item.label] ?? activeGroup === item.label
                  const childActive = hasChildren && item.children.some((c) => isActive(c.href))
                  const selfActive = isActive(item.href)
                  const active = hasChildren ? childActive || selfActive : selfActive

                  // Próximamente: se muestra, pero no navega a un 404.
                  if (item.soon) {
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-2 rounded-field px-3 py-2 text-sm text-white/35"
                        title="Próximamente"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={16} aria-hidden />
                          {item.label}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
                          Pronto
                        </span>
                      </div>
                    )
                  }

                  return (
                    <div key={item.label}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenus((prev) => ({ ...prev, [item.label]: !isOpen }))
                          }
                          aria-expanded={Boolean(isOpen)}
                          className={`flex w-full items-center justify-between rounded-field border px-3 py-2 text-sm transition ${
                            active || isOpen
                              ? 'border-white/15 bg-white/10 text-white'
                              : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon
                              size={16}
                              aria-hidden
                              className={active ? 'text-gold-soft' : ''}
                            />
                            <span className="font-medium">{item.label}</span>
                          </span>
                          <ChevronDown
                            size={14}
                            aria-hidden
                            className={`transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-gold-soft' : 'text-white/35'
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={`group flex items-center gap-2.5 rounded-field border px-3 py-2 text-sm transition ${
                            active
                              ? 'border-gold/35 bg-gradient-to-r from-gold-soft/20 to-transparent font-semibold text-white'
                              : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon
                            size={16}
                            aria-hidden
                            className={
                              active
                                ? 'text-gold-soft'
                                : 'transition group-hover:text-gold-soft'
                            }
                          />
                          {item.label}
                        </Link>
                      )}

                      {hasChildren && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'mt-1 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="ml-4 space-y-0.5 border-l border-white/10 py-1 pl-3">
                            {item.children.map((child) => {
                              const activeChild = isActive(child.href)
                              return (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setSidebarOpen(false)}
                                  aria-current={activeChild ? 'page' : undefined}
                                  className={`block rounded-md px-2.5 py-1.5 text-xs transition ${
                                    activeChild
                                      ? 'bg-white/8 font-semibold text-gold-soft'
                                      : 'text-white/45 hover:bg-white/5 hover:text-white'
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
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-0.5 border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-field px-3 py-2 text-sm text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <Home size={16} aria-hidden />
            <span className="font-medium">Ver tienda</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-field px-3 py-2 text-sm text-white/65 transition hover:bg-red-500/15 hover:text-red-200"
          >
            <LogOut size={16} aria-hidden />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen w-full min-w-0 flex-col overflow-hidden md:ml-72">
        <header
          className="sticky top-0 z-20 shrink-0 border-b border-white/10 backdrop-blur-xl"
          style={topbarStyle}
        >
          <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
                className="rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
              >
                <Menu size={18} aria-hidden />
              </button>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-gold-soft">Admin</p>
                <h2 className="truncate font-serif text-base leading-tight text-white">
                  {titleForPath(pathname)}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {today && (
                <div className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] text-white/55 sm:flex">
                  <Calendar size={11} aria-hidden />
                  <span className="capitalize">{today}</span>
                </div>
              )}
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[11px] text-white/75 transition hover:bg-white/12 hover:text-white sm:inline-flex"
              >
                <ExternalLink size={11} aria-hidden />
                Tienda
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 w-full max-w-full flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}
