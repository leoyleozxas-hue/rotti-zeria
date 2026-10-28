# Layouts — rotti-zeria (Biarritz)

Shells, navegación y estructura de página, con el contenido completo de cada archivo. Hay **dos shells independientes**: tienda y admin.

## Mapa de shells

| Shell | Archivo | Alcance | Renderiza |
|---|---|---|---|
| Root layout | `app/layout.jsx` | todas las rutas | `<html lang="es">`, fuentes, `StoreShell` |
| Store shell | `components/StoreShell.jsx` | todas las rutas salvo `/admin/*` | `Header` + `<main class="flex-1 pt-[4.25rem]">` + `Footer` + `CartDrawer` |
| Admin shell | `app/admin/layout.jsx` | `/admin/*` (salvo `/admin/login`) | sidebar fijo `w-72` + topbar sticky + `<main>` |
| Login (sin shell) | `app/admin/login/page.jsx` | `/admin/login` | pantalla centrada; el admin layout corta y solo añade `<Toaster>` |

Decisiones estructurales a respetar al reproducir:

- La separación tienda/admin se decide **en cliente** con `usePathname()` dentro de `StoreShell` (`pathname.startsWith('/admin')`), no con route groups.
- `Header` es `fixed` de `4.25rem` (68px) de alto; `StoreShell` compensa con `pt-[4.25rem]`. Las páginas que quieren full-bleed debajo del header (home, productos, eventos, contacto) aplican `-mt-[4.25rem]`.
- No existe componente de breadcrumb.
- No hay `error.jsx`, `loading.jsx` ni `not-found.jsx` en ninguna ruta; los estados de carga se resuelven con `<Suspense>` inline.

---

## `app/layout.jsx` — Root layout

Carga Fraunces e Inter con `next/font/google` como variables CSS (`--font-fraunces`, `--font-inter`), define `metadata` (title/description) y envuelve todo en `StoreShell`. El `<body>` fija `font-sans bg-cream text-chocolate antialiased min-h-screen flex flex-col`.

```jsx
// app/layout.jsx
import { Fraunces, Inter } from 'next/font/google'
import StoreShell from '@/components/StoreShell'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Biarritz | Panadería desde 1935',
  description: 'Panadería artesanal con pedidos online. Facturas, panes y delicias recién horneadas.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans bg-cream text-chocolate antialiased min-h-screen flex flex-col">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  )
}
```

---

## `components/StoreShell.jsx` — Shell de tienda

Componente cliente que decide qué chrome mostrar. En `/admin/*` devuelve solo `children` (el admin layout ya aporta su propio shell); en el resto monta `Header`, el `<main>` con el offset del header, `Footer` y `CartDrawer`.

```jsx
// components/StoreShell.jsx
'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default function StoreShell({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[4.25rem]">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}
```

---

## `components/Header.jsx` — Barra de navegación superior

Header `fixed`, translúcido oscuro (`bg-[#1a0806]/50` + `backdrop-blur-xl`), 68px de alto, `max-w-6xl`. Contiene: logo (`/images/logo-biarritz-blanco.png` con `mix-blend-screen`), 4 links de navegación con estado activo (subrayado dorado en desktop, borde izquierdo dorado en el menú móvil), corazón con badge de favoritos, bolsa con badge de carrito y hamburguesa. Los badges se renderizan tras `mounted` para evitar mismatch de hidratación.

Nav revelante para diseño — `NAV_LINKS`: `Inicio` `/`, `Productos` `/productos`, `Lunch & Eventos` `/eventos`, `Contacto` `/contacto`.

```jsx
// components/Header.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useUIStore } from '@/lib/store/uiStore'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/eventos', label: 'Lunch & Eventos' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.getCount())
  const favCount = useFavoritesStore((s) => s.getCount())
  const openCart = useUIStore((s) => s.openCart)
  
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#1a0806]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#1a0806]/40">
      <div className="max-w-6xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-4">
        <Link
          href="/"
          className="relative shrink-0 hover:opacity-90 transition"
          aria-label="Biarritz — Inicio"
        >
          <Image
            src="/images/logo-biarritz-blanco.png"
            alt="Biarritz"
            width={260}
            height={96}
            priority
            className="h-14 sm:h-16 w-auto mix-blend-screen"
          />
        </Link>

        <nav className="hidden md:flex gap-8 text-sm">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${
                  active
                    ? 'text-white font-semibold border-b border-[#C9A96E] pb-0.5'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1 text-white">
          <Link href="/favoritos" className="relative p-2 hover:text-[#E0C89A] transition" aria-label="Favoritos">
            <Heart size={22} />
            {mounted && favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>

          <button onClick={openCart} className="relative p-2 hover:text-[#E0C89A] transition" aria-label="Carrito">
            <ShoppingBag size={22} />
            {mounted && count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C9A96E] text-[#2C1E16] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:text-[#E0C89A] transition"
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-[#1a0806]/90 backdrop-blur-xl">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-2 transition ${
                    active
                      ? 'text-white font-semibold border-l-2 border-[#C9A96E] pl-3'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
```

---

## `components/Footer.jsx` — Pie de página

Server component. Fondo de **textura de madera** con gradiente oscuro inline (`/images/textura-madera.png`), texto `text-cream`. Grilla de 3 columnas: marca, contacto y horarios; barra inferior con copyright y el acceso a `/admin/login` (icono `Lock` + "Acceso Admin"), que es el **único** enlace público al panel.

```jsx
// components/Footer.jsx
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      className="text-cream mt-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(18,4,2,.75), rgba(18,4,2,.82)), url('/images/textura-madera.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl mb-3">Biarritz</h3>
          <p className="text-sm text-cream/70">
            Panadería artesanal. Elaborado a mano, todos los días.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Contacto</h4>
          <p className="text-sm text-cream/70">Av. Siempre Viva 123</p>
          <p className="text-sm text-cream/70">WhatsApp: 11 1234-5678</p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Horarios</h4>
          <p className="text-sm text-cream/70">Lun a Sáb: 7:00 - 20:00</p>
          <p className="text-sm text-cream/70">Dom: 8:00 - 13:00</p>
        </div>
      </div>

      {/* Barra inferior del Footer */}
      <div className="border-t border-cream/10 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Biarritz. Todos los derechos reservados.</p>
          
          {/* Botón de Acceso Admin */}
          <Link 
            href="/admin/login" 
            className="flex items-center gap-1.5 hover:text-[#C9A96E] transition-colors group"
            title="Acceso al panel de administración"
          >
            <Lock size={12} className="group-hover:text-[#C9A96E] transition-colors" />
            <span>Acceso Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
```

---

## `app/admin/layout.jsx` — Shell del panel de administración

Es el archivo de layout más complejo del repo (301 líneas). Estructura:

- **Sidebar fijo** `w-72` (`fixed inset-y-0 left-0`, `z-40`) con textura de madera vertical, logo grande, nav con dos grupos expandibles (`Pedidos`, `Productos`) y dos links sueltos (`Destacados`, `Lunch & Eventos` — **ambos rotos**, ver `routes.md`), más "Ver tienda" y "Cerrar sesión".
- **Topbar sticky** (`h-14`, `z-20`) con hamburguesa móvil, kicker "Admin" + título derivado del pathname (`Pedidos` / `Productos` / `Dashboard`), chip de fecha en `es-AR` y pill "Tienda".
- **`<main>`** `p-4 md:p-6 lg:p-8`, `md:ml-72` en el wrapper.
- **`<Toaster position="top-right" richColors />`** de sonner — es el único Toaster de la app.
- En `pathname === '/admin/login'` **corta el shell** y devuelve `children` + `Toaster`.
- `NAV_LINKS` es la fuente de verdad de la navegación admin; los hijos usan query strings (`?estado=`, `?categoria=`).
- `isLinkActive()` compara `pathname + search` contra el href, por eso las pestañas hijas se marcan correctamente.
- Todo el layout está envuelto en `<Suspense>` porque usa `useSearchParams()`.

```jsx
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
```

---

## `app/admin/login/page.jsx` — Pantalla sin shell

No es un layout, pero define la única ruta que **bypassea** el shell admin: fondo de madera vertical, tarjeta `bg-white/15 backdrop-blur-xl` sin `rounded`, logo con `mix-blend-screen`, botón "Volver a la tienda" como pill flotante arriba a la izquierda. Se incluye porque toda reproducción de `/admin/login` depende de estas clases, no del admin layout.

```jsx
// app/admin/login/page.jsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const woodBg = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.55), rgba(18,4,2,.7)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales inválidas')
      setLoading(false)
      return
    }

    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('No tenés permisos para acceder')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative" style={woodBg}>
      {/* Botón volver */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/70 hover:text-white transition text-sm border border-white/20 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full"
      >
        <ArrowLeft size={16} />
        Volver a la tienda
      </Link>

      <div className="w-full max-w-md border border-white/25 bg-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.2)] p-8 text-[#F5EDE3]">
        <div className="text-center mb-8">
          <Image
            src="/images/logo-biarritz-blanco.png"
            alt="Biarritz"
            width={200}
            height={73}
            className="h-12 w-auto mx-auto mb-4 mix-blend-screen"
          />
          <div className="w-12 h-12 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} />
          </div>
          <h1 className="font-serif text-3xl text-white">Panel Biarritz</h1>
          <p className="text-white/65 text-sm mt-2">Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-white/25 bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none transition"
              placeholder="admin@biarritz.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-white/25 bg-white/10 backdrop-blur-md text-white focus:border-white/50 focus:outline-none transition"
            />
          </div>

          {error && (
            <p className="text-red-200 text-sm bg-red-500/20 border border-red-400/30 p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] py-3.5 rounded-full hover:bg-white transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
```

---

## Apéndice — `proxy.js` (gate de autenticación del shell admin)

No es un componente, pero condiciona qué se puede ver en `/admin/*`. Convención `proxy` de Next 16 (antes `middleware`). Matcher: `/admin/:path*`. Sin usuario → redirect a `/admin/login`; con usuario sin `app_metadata.role === 'admin'` → redirect a `/`. `/admin/login` queda excluido de la comprobación.

```js
// proxy.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const role = user.app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```
