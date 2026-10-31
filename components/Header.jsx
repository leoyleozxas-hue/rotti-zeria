// components/Header.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useUIStore } from '@/lib/store/uiStore'
import useHydrated from '@/lib/hooks/useHydrated'
import { useState, useEffect, useRef } from 'react'
import { IconButton, IconLink } from '@/components/ui/button'
import SiteLogo from '@/components/SiteLogo'
import MarqueeBanner from '@/components/MarqueeBanner'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/lunch-eventos', label: 'Lunch & Eventos' },
  { href: '/contacto', label: 'Contacto' },
]

// Páginas con hero oscuro → nav transparente al inicio
const TRANSPARENT_ROUTES = ['/', '/productos', '/lunch-eventos', '/contacto']

export default function Header() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.getCount())
  const favCount = useFavoritesStore((s) => s.getCount())
  const openCart = useUIStore((s) => s.openCart)
  const mounted = useHydrated()
  const [menuOpen, setMenuOpen] = useState(false)

  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollRef = useRef(0)
  const rafRef = useRef(null)

  // Reset al cambiar de página
  useEffect(() => {
    setMenuOpen(false)
    setHidden(false)
    setScrolled(false)
    lastScrollRef.current = 0
  }, [pathname])

  // Scroll listener (con requestAnimationFrame para no matar performance)
  useEffect(() => {
    function handleScroll() {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY
        const last = lastScrollRef.current

        // Nav toma color cuando pasa los 20px
        setScrolled(y > 20)

        // Lógica del marquee
        if (y < 50) {
          setHidden(false) // siempre visible arriba de todo
        } else if (y > last && y > 100) {
          setHidden(true) // scrolleando para abajo → se oculta
        } else if (y < last) {
          setHidden(false) // scrolleando para arriba → aparece
        }

        lastScrollRef.current = y
        rafRef.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const isTransparentRoute = TRANSPARENT_ROUTES.includes(pathname)
  const navTransparent = isTransparentRoute && !scrolled && !menuOpen

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
        hidden && !menuOpen ? '-translate-y-10' : 'translate-y-0'
      }`}
    >
      {/* Marquee */}
      <MarqueeBanner className="bg-ink-950 border-b border-gold/20" />

      {/* Nav */}
      <div
        className={`transition-all duration-300 ${
          navTransparent
            ? 'bg-transparent border-b border-transparent'
            : 'bg-ink-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-4">
          <Link href="/" className="relative shrink-0 hover:opacity-90 transition" aria-label="Inicio">
            <SiteLogo variant="light" />
          </Link>

          <nav className="hidden md:flex gap-8 text-caption" aria-label="Principal">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`transition ${
                    active
                      ? 'text-white font-semibold border-b-2 border-gold pb-1'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1">
            <IconLink href="/favoritos" label="Favoritos" variant="accent" size="iconLg" className="relative">
              <Heart size={22} />
              {mounted && favCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-eyebrow font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center tabular">
                  {favCount}
                </span>
              )}
            </IconLink>

            <IconButton label="Abrir carrito" onClick={openCart} variant="accent" size="iconLg" className="relative">
              <ShoppingBag size={22} />
              {mounted && count > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-gold text-ink-700 text-eyebrow font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center tabular">
                  {count}
                </span>
              )}
            </IconButton>

            <IconButton
              label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((v) => !v)}
              variant="accent"
              size="iconLg"
              aria-expanded={menuOpen}
              className="md:hidden"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </IconButton>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-white/10 bg-ink-900" aria-label="Menú principal">
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`py-3 px-2 transition ${
                      active
                        ? 'text-white font-semibold border-l-2 border-gold pl-3'
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
      </div>
    </header>
  )
}