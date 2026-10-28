// components/Header.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useUIStore } from '@/lib/store/uiStore'
import useHydrated from '@/lib/hooks/useHydrated'
import { useState } from 'react'

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
  
  const mounted = useHydrated()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#1a0806]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#1a0806]/40">
      <div className="max-w-6xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-4">
        <Link
          href="/"
          className="relative shrink-0 hover:opacity-90 transition"
          aria-label="Biarritz — Inicio"
        >
          <Image
            src="/images/logo-biarritz-blanco-trim.png"
            alt="Biarritz"
            width={356}
            height={134}
            priority
            className="h-10 w-auto sm:h-11"
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
                  onClick={() => setMenuOpen(false)}
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