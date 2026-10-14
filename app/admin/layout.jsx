// app/admin/layout.jsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogOut,
  Home,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  // Si es login, no mostramos el sidebar
  if (pathname === '/admin/login') {
    return children
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-wood text-cream flex flex-col fixed inset-y-0 left-0">
        <div className="p-6 border-b border-cream/10">
          <Link href="/admin" className="font-serif text-2xl">
            Biarritz
          </Link>
          <p className="text-xs text-cream/60 mt-1">Panel de administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {LINKS.map((link) => {
            const Icon = link.icon
            const active =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? 'bg-gold text-chocolate font-semibold'
                    : 'text-cream/80 hover:bg-cream/10 hover:text-cream'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-cream/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-cream/80 hover:bg-cream/10 transition"
          >
            <Home size={18} />
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cream/80 hover:bg-red-500/20 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  )
}