// app/admin/layout.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
]

// Sidebar: madera vertical con overlay oscuro (la textura se ve, pero atenuada)
const woodSidebar = {
  backgroundImage:
    "linear-gradient(rgba(10,3,1,.72), rgba(10,3,1,.85)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

// Main: madera horizontal muy atenuada + gradientes radiales para dar profundidad
const woodMain = {
  backgroundColor: '#150604',
  backgroundImage:
    "radial-gradient(circle at 15% 8%, rgba(201,169,110,.09), transparent 55%), radial-gradient(circle at 85% 92%, rgba(90,26,16,.22), transparent 60%), linear-gradient(rgba(10,3,1,.88), rgba(10,3,1,.92)), url('/images/textura-madera.png')",
  backgroundSize: 'cover, cover, cover, cover',
  backgroundPosition: 'center, center, center, center',
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
      {/* Sidebar */}
      <aside
        className="w-72 flex flex-col fixed inset-y-0 left-0 border-r border-white/10 z-20 shadow-2xl"
        style={woodSidebar}
      >
        {/* Logo grande y protagónico */}
        <div className="p-7 pb-6 border-b border-white/10">
          <Link href="/admin" className="block">
            <Image
              src="/images/logo-biarritz-blanco.png"
              alt="Biarritz"
              width={280}
              height={100}
              priority
              className="w-full h-auto max-h-28 object-contain mix-blend-screen"
            />
          </Link>
          <div className="flex items-center gap-2 mt-4">
            <span className="h-px flex-1 bg-[#E0C89A]/40" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#E0C89A]">
              Panel
            </p>
            <span className="h-px flex-1 bg-[#E0C89A]/40" />
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1.5">
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
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 border ${
                  active
                    ? 'bg-gradient-to-r from-[#E0C89A]/25 to-[#E0C89A]/10 border-[#E0C89A]/40 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.15)]'
                    : 'border-transparent text-white/70 hover:bg-white/8 hover:text-white hover:border-white/10'
                }`}
              >
                <Icon
                  size={19}
                  className={active ? 'text-[#E0C89A]' : 'group-hover:text-[#E0C89A] transition'}
                />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-white/10 space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/8 hover:text-white transition"
          >
            <Home size={18} />
            <span className="font-medium">Ver tienda</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/15 hover:text-red-200 transition"
          >
            <LogOut size={18} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-72 p-8 lg:p-10 relative z-10 min-h-screen">
        {children}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}