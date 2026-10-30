// app/productos/page.jsx
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { SITE_CONFIG } from '@/lib/config'

const PAGE_SIZE = 12

const woodCatalog = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.85), rgba(18,4,2,.90)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}

const CATEGORIES = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Panes', label: 'Panes' },
  { value: 'Facturas', label: 'Facturas' },
  { value: 'Dulces', label: 'Dulces' },
  { value: 'Salados', label: 'Salados' },
  { value: 'Bocados calientes', label: 'Bocados' },
  { value: 'Lunch', label: 'Lunch' },
]

function buildUrl({ categoria, page }) {
  const params = new URLSearchParams()
  if (categoria && categoria !== 'Todos') params.set('categoria', categoria)
  if (page && page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/productos?${qs}` : '/productos'
}

async function ProductosGrid({ categoria, page }) {
  const supabase = await createClient()

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_available', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to)

  if (categoria && categoria !== 'Todos') {
    query = query.eq('category', categoria)
  }

  const { data: products, error, count } = await query

  if (error) {
    return (
      <div className="text-red-300 bg-red-900/50 p-4 rounded-lg">
        Error: {error.message}
      </div>
    )
  }

  const total = count || 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-6">
        <p className="text-white text-lg">No hay productos en esta categoría.</p>
        <Link
          href="/productos"
          className="text-[#E0C89A] hover:text-white mt-4 inline-block underline"
        >
          Ver todos
        </Link>
      </div>
    )
  }

  const startNum = from + 1
  const endNum = Math.min(from + products.length, total)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-12">
        {products.map((p, index) => (
          <div
            key={p.id}
            className="anim-rise"
            style={{ animationDelay: index < 8 ? `${index * 60}ms` : '0ms' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-8 pb-4 space-y-4">
        <p className="text-center text-[#E0C89A] text-sm font-medium uppercase tracking-wider">
          Mostrando {startNum}–{endNum} de {total}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Anterior */}
            {page > 1 ? (
              <Link
                href={buildUrl({ categoria, page: page - 1 })}
                className="px-3 sm:px-4 py-2 rounded-lg bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white transition text-xs sm:text-sm font-medium"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="px-3 sm:px-4 py-2 rounded-lg bg-white/5 text-white/25 border border-white/10 text-xs sm:text-sm">
                ← Anterior
              </span>
            )}

            {/* Números */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const active = p === page
                return (
                  <Link
                    key={p}
                    href={buildUrl({ categoria, page: p })}
                    className={`min-w-9 h-9 sm:min-w-10 sm:h-10 px-2 rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition ${
                      active
                        ? 'bg-[#E0C89A] text-[#2b0f0b] shadow-md'
                        : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {p}
                  </Link>
                )
              })}
            </div>

            {/* Siguiente */}
            {page < totalPages ? (
              <Link
                href={buildUrl({ categoria, page: page + 1 })}
                className="px-3 sm:px-4 py-2 rounded-lg bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white transition text-xs sm:text-sm font-medium"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="px-3 sm:px-4 py-2 rounded-lg bg-white/5 text-white/25 border border-white/10 text-xs sm:text-sm">
                Siguiente →
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default async function ProductosPage({ searchParams }) {
  const params = await searchParams
  const categoria = params?.categoria || 'Todos'
  const page = Math.max(1, parseInt(params?.page || '1', 10) || 1)

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[35vh] md:min-h-[45vh] -mt-[4.25rem] pt-[4.25rem] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=85"
          alt={`Productos ${SITE_CONFIG.businessName}`}
          fill
          priority
          className="object-cover object-center scale-105 animate-[hero-zoom_1.4s_ease-out_both]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#150604]/90 via-[#3a130d]/70 to-[#C9A96E]/40" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center anim-rise">
          <span className="text-[#E0C89A] text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold mb-3 sm:mb-4 block">
            Elaboración Artesanal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl text-white mb-3 sm:mb-6 drop-shadow-xl">
            Nuestro Catálogo
          </h1>
          <p className="text-white/90 text-sm sm:text-lg md:text-xl font-light max-w-xl mx-auto mb-5 sm:mb-8">
            Descubrí el sabor de lo hecho a mano. Elegí tus favoritos y retiralos frescos por el local.
          </p>
          <div className="w-16 sm:w-24 h-px bg-[#E0C89A] mx-auto"></div>
        </div>
      </section>

      <section style={woodCatalog} className="py-8 sm:py-12 min-h-screen bg-parallax">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:gap-8">

            {/* MOBILE: pills horizontales con scroll */}
            <div className="lg:hidden mb-6 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => {
                  const active = categoria === cat.value
                  return (
                    <Link
                      key={cat.value}
                      href={buildUrl({ categoria: cat.value, page: 1 })}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm transition border ${
                        active
                          ? 'bg-[#2B0F0B] text-white border-[#2B0F0B] font-semibold'
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {cat.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* DESKTOP: sidebar con hover + tarjetas decorativas */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">

                {/* Categorías */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40">
                  <h2 className="font-serif text-lg text-[#2B0F0B] mb-3 pb-3 border-b border-gray-200">
                    Categorías
                  </h2>
                  <ul className="space-y-1">
                    {CATEGORIES.map((cat) => {
                      const active = categoria === cat.value
                      return (
                        <li key={cat.value}>
                          <Link
                            href={buildUrl({ categoria: cat.value, page: 1 })}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                              active
                                ? 'bg-[#2B0F0B] text-white font-semibold shadow-md'
                                : 'text-gray-600 hover:bg-[#EADFC8] hover:text-[#2B0F0B] hover:pl-4'
                            }`}
                          >
                            <span>{cat.label}</span>
                            <ChevronRight
                              size={14}
                              className={`transition-all ${
                                active
                                  ? 'opacity-100'
                                  : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                              }`}
                            />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* Card decorativa: CTA Lunch */}
                <div
                  className="rounded-2xl overflow-hidden shadow-xl border border-white/40"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(18,4,2,.72), rgba(18,4,2,.88)), url('/images/textura-madera-vertical.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="p-5 text-white">
                    <span className="text-[#E0C89A] text-[9px] uppercase tracking-[0.2em] font-bold block mb-2">
                      ¿Algo especial?
                    </span>
                    <h3 className="font-serif text-lg mb-2 leading-tight">
                      Combos para eventos
                    </h3>
                    <p className="text-white/70 text-xs mb-4 leading-relaxed">
                      Bandejas a medida para reuniones, cumpleaños y oficinas.
                    </p>
                    <Link
                      href="/lunch-eventos"
                      className="inline-flex items-center gap-1 text-[#E0C89A] text-xs font-semibold border-b border-[#E0C89A]/50 pb-0.5 hover:text-white hover:border-white transition group"
                    >
                      Ver combos
                      <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>

              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <Suspense
                fallback={
                  <p className="text-white/70 animate-pulse">Cargando productos...</p>
                }
              >
                <ProductosGrid categoria={categoria} page={page} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}