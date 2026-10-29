// app/admin/layout.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home,
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'
import { ADMIN_NAV, titleForPath } from '@/lib/constants/nav'
import { useNotificationStore } from '@/lib/store/notificationStore'
import SiteLogo from '@/components/SiteLogo'

const SIDEBAR_WIDTH = 288 // px (equivale a w-72)

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

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

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
  const [collapsed, setCollapsed] = useState(false)
  const [today, setToday] = useState('')
  const [openMenus, setOpenMenus] = useState({})

  const { pendingOrders, newConsultas, setCounts } = useNotificationStore()

  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname

  // Fecha del topbar
  useEffect(() => {
    const id = setTimeout(() => {
      setToday(
        new Date().toLocaleDateString('es-AR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        })
      )
    }, 0)
    return () => clearTimeout(id)
  }, [])

  // Realtime: contadores
  useEffect(() => {
    if (pathname === '/admin/login') return
    const supabase = createClient()

    async function refreshCounts() {
      const [ordersRes, consultasRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending_payment', 'payment_review']),
        supabase
          .from('consultas')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new'),
      ])
      setCounts({
        pendingOrders: ordersRes.count || 0,
        newConsultas: consultasRes.count || 0,
      })
    }

    refreshCounts()

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => refreshCounts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consultas' },
        () => refreshCounts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pathname, setCounts])

  const activeGroup = pathname.startsWith('/admin/pedidos')
    ? 'Pedidos'
    : pathname.startsWith('/admin/productos')
      ? 'Productos'
      : null

  // Auto-abrir el grupo activo al navegar (acordeón estricto)
  useEffect(() => {
    if (activeGroup) {
      setOpenMenus({ [activeGroup]: true })
    } else {
      setOpenMenus({})
    }
  }, [activeGroup])

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

  function handleMenuToggle(label) {
    setOpenMenus((prev) => {
      const isCurrentlyOpen = prev[label] ?? activeGroup === label
      if (isCurrentlyOpen) {
        return { ...prev, [label]: false }
      }
      // Abrir este, cerrar todos los demás
      const next = {}
      ADMIN_NAV.forEach((section) => {
        section.items.forEach((i) => {
          if (i.children?.length) next[i.label] = false
        })
      })
      next[label] = true
      return next
    })
  }

  const isActive = (href) => {
    if (!href) return false
    if (href === '/admin') return pathname === '/admin'
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    return query ? currentUrl === href : !searchParams.toString()
  }

  const counts = { pendingOrders, newConsultas }

  return (
    <div className="admin-scope flex min-h-screen text-cream" style={woodMain}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ──────────────── SIDEBAR ──────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 shadow-2xl transition-transform duration-[400ms] ${EASE} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:-translate-x-full' : 'md:translate-x-0'}`}
        style={woodSidebar}
        aria-label="Navegación del panel"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="block flex-1">
            <SiteLogo variant="light" />
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
                  const isOpen =
                    openMenus[item.label] !== undefined
                      ? openMenus[item.label]
                      : activeGroup === item.label
                  const childActive =
                    hasChildren && item.children.some((c) => isActive(c.href))
                  const selfActive = isActive(item.href)
                  const active = hasChildren
                    ? childActive || selfActive
                    : selfActive
                  const badgeValue = item.badgeKey ? counts[item.badgeKey] : 0

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
                          onClick={() => handleMenuToggle(item.label)}
                          aria-expanded={Boolean(isOpen)}
                          className={`flex w-full items-center justify-between rounded-field border px-3 py-2 text-sm transition-colors ${
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
                            {badgeValue > 0 && (
                              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white tabular-nums">
                                {badgeValue}
                              </span>
                            )}
                          </span>
                          <ChevronDown
                            size={14}
                            aria-hidden
                            className={`transition-transform duration-[350ms] ${EASE} ${
                              isOpen
                                ? 'rotate-180 text-gold-soft'
                                : 'text-white/35'
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={`group flex items-center justify-between gap-2.5 rounded-field border px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'border-gold/35 bg-gradient-to-r from-gold-soft/20 to-transparent font-semibold text-white'
                              : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
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
                          </span>
                          {badgeValue > 0 && (
                            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white tabular-nums">
                              {badgeValue}
                            </span>
                          )}
                        </Link>
                      )}

                      {hasChildren && (
                        <div
                          className={`overflow-hidden transition-[max-height,opacity] duration-[350ms] ${EASE} ${
                            isOpen
                              ? 'mt-1 max-h-96 opacity-100'
                              : 'max-h-0 opacity-0'
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
                                  aria-current={
                                    activeChild ? 'page' : undefined
                                  }
                                  className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
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

      {/* ──────── TAB LATERAL (solo desktop) ──────── */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        className={`hidden md:flex fixed top-1/2 z-50 h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/15 bg-ink-900/95 text-white/70 shadow-lg backdrop-blur-xl transition-[left,background-color,color] duration-[400ms] ${EASE} hover:bg-ink-800 hover:text-gold-soft ${
          collapsed ? 'left-0' : 'left-72'
        }`}
      >
        {collapsed ? (
          <ChevronRight size={14} aria-hidden />
        ) : (
          <ChevronLeft size={14} aria-hidden />
        )}
      </button>

      {/* ──────── CONTENIDO PRINCIPAL ──────── */}
      <div
        className={`flex min-h-screen w-full min-w-0 flex-col overflow-hidden transition-[margin-left] duration-[400ms] ${EASE} ${
          collapsed ? 'md:ml-0' : 'md:ml-72'
        }`}
      >
        <header
          className="sticky top-0 z-20 shrink-0 border-b border-white/10 backdrop-blur-xl"
          style={topbarStyle}
        >
          <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {/* Hamburguesa animada (mobile) */}
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={sidebarOpen}
                className="relative h-5 w-6 shrink-0 md:hidden"
              >
                <span
                  className="absolute left-1/2 top-1/2 h-0.5 w-6 rounded-full bg-white transition-transform duration-300 ease-out"
                  style={{
                    transform: sidebarOpen
                      ? 'translate(-50%, -50%) rotate(45deg)'
                      : 'translate(-50%, -50%) translateY(-6px)',
                  }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-0.5 w-6 rounded-full bg-white transition-all duration-200"
                  style={{
                    transform: 'translate(-50%, -50%)',
                    opacity: sidebarOpen ? 0 : 1,
                  }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-0.5 w-6 rounded-full bg-white transition-transform duration-300 ease-out"
                  style={{
                    transform: sidebarOpen
                      ? 'translate(-50%, -50%) rotate(-45deg)'
                      : 'translate(-50%, -50%) translateY(6px)',
                  }}
                />
              </button>

              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-gold-soft">
                  Admin
                </p>
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