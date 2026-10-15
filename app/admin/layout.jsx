// app/admin/layout.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
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

const woodSidebar = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.72), rgba(18,4,2,.82)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const woodMain = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.55), rgba(18,4,2,.68)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <div className="min-h-screen flex text-[#F5EDE3]" style={woodMain}>
      <aside
        className="w-64 flex flex-col fixed inset-y-0 left-0 border-r border-white/10 z-20"
        style={woodSidebar}
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="block">
            <Image
              src="/images/logo-biarritz-blanco.png"
              alt="Biarritz"
              width={160}
              height={58}
              className="h-9 w-auto mix-blend-screen"
            />
          </Link>
          <p className="text-xs text-white/55 mt-2">Panel de administración</p>
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
                className={`flex items-center gap-3 px-4 py-3 transition border ${
                  active
                    ? 'bg-white/20 border-white/30 text-white backdrop-blur-md'
                    : 'border-transparent text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-white/75 hover:bg-white/10 hover:text-white transition"
          >
            <Home size={18} />
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/75 hover:bg-red-500/20 hover:text-red-200 transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 relative z-10">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  )
}
