// components/Header.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
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
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-beige">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl text-chocolate">
          Biarritz
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
                    ? 'text-chocolate font-semibold border-b-2 border-gold pb-1'
                    : 'text-caramel hover:text-chocolate'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          {/* Favoritos */}
          <Link
            href="/favoritos"
            className="relative p-2 hover:text-red-400 transition"
            aria-label="Favoritos"
          >
            <Heart size={22} />
            {mounted && favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>

          {/* Carrito */}
          <Link
            href="/carrito"
            className="relative p-2 hover:text-caramel transition"
            aria-label="Carrito"
          >
            <ShoppingBag size={22} />
            {mounted && count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-chocolate text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Hamburguesa mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:text-caramel transition"
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-beige bg-cream">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-2 rounded-lg transition ${
                    active
                      ? 'bg-beige text-chocolate font-semibold'
                      : 'text-caramel hover:bg-beige'
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