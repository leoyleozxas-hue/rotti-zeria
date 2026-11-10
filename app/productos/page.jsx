// app/productos/page.jsx
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Cake,
  Croissant,
  Flame,
  LayoutGrid,
  SearchX,
  Sandwich,
  Wheat,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import ProductSearch from '@/components/ProductSearch'
import ProductsSidebar from '@/components/ProductsSidebar'
import { SITE_CONFIG } from '@/lib/config'

const PAGE_SIZE = 12
const PREVIEW_COUNT = 3

const CATEGORIES = [
  { value: 'Todos', label: 'Todos', icon: LayoutGrid, note: 'Todo lo que horneamos, ordenado por categoría.' },
  { value: 'Panes', label: 'Panes', icon: Wheat, note: 'De campo, integrales y masa madre.' },
  { value: 'Facturas', label: 'Facturas', icon: Croissant, note: 'Medialunas, croissants y más.' },
  { value: 'Dulces', label: 'Dulces', icon: Cake, note: 'Masas finas, secas y húmedas.' },
  { value: 'Salados', label: 'Salados', icon: Sandwich, note: 'Sánguches de miga y tartas.' },
  { value: 'Bocados calientes', label: 'Bocados', icon: Flame, note: 'Chipá, prepizzas y calentitos.' },
  { value: 'Lunch', label: 'Lunch', icon: Briefcase, note: 'Bandejas y combos para reuniones.' },
]

function buildUrl({ categoria, page, q }) {
  const params = new URLSearchParams()
  if (categoria && categoria !== 'Todos') params.set('categoria', categoria)
  if (page && page > 1) params.set('page', String(page))
  if (q && q.trim()) params.set('q', q.trim())
  const qs = params.toString()
  return qs ? `/productos?${qs}` : '/productos'
}

function groupByCategory(products) {
  const map = new Map()
  for (const p of products) {
    if (!map.has(p.category)) map.set(p.category, [])
    map.get(p.category).push(p)
  }
  return [...map.entries()]
}

const GRID =
  'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3'

function GridSkeleton() {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse bg-beige" />
          <div className="mt-5 h-3 w-16 animate-pulse bg-beige" />
          <div className="mt-3 h-5 w-3/4 animate-pulse bg-beige" />
          <div className="mt-5 h-6 w-24 animate-pulse bg-beige" />
        </div>
      ))}
    </div>
  )
}

function Pagination({ categoria, q, page, totalPages, startNum, endNum, total }) {
  const edge =
    'inline-flex items-center gap-2 px-3 py-2 text-caption font-medium transition'
  return (
    <div className="mt-16 border-t border-sand/50 pt-8">
      <p className="mb-5 text-center text-caption text-stone">
        Mostrando {startNum}–{endNum} de {total} productos
      </p>

      {totalPages > 1 && (
        <nav
          aria-label="Paginación"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {page > 1 ? (
            <Link
              href={buildUrl({ categoria, page: page - 1, q })}
              className={`${edge} text-chocolate hover:text-ember`}
            >
              <ArrowLeft size={14} /> Anterior
            </Link>
          ) : (
            <span className={`${edge} text-sand`}>
              <ArrowLeft size={14} /> Anterior
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const active = p === page
            return (
              <Link
                key={p}
                href={buildUrl({ categoria, page: p, q })}
                aria-current={active ? 'page' : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-caption font-semibold transition ${
                  active ? 'bg-chocolate text-cream' : 'text-caramel hover:bg-beige'
                }`}
              >
                {p}
              </Link>
            )
          })}

          {page < totalPages ? (
            <Link
              href={buildUrl({ categoria, page: page + 1, q })}
              className={`${edge} text-chocolate hover:text-ember`}
            >
              Siguiente <ArrowRight size={14} />
            </Link>
          ) : (
            <span className={`${edge} text-sand`}>
              Siguiente <ArrowRight size={14} />
            </span>
          )}
        </nav>
      )}
    </div>
  )
}

function CategorySection({ cat, items, q }) {
  const previewItems = items.slice(0, PREVIEW_COUNT)
  const hasMore = items.length > PREVIEW_COUNT
  const catData = CATEGORIES.find((c) => c.value === cat)
  const Icon = catData?.icon

  return (
    <section aria-labelledby={`cat-${cat}`} className="scroll-mt-32">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sand/60 bg-paper text-gold">
            <Icon size={20} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h3 id={`cat-${cat}`} className="font-serif text-h2 text-chocolate">
            {cat}
          </h3>
          {catData?.note && (
            <p className="mt-1 text-caption text-caramel">{catData.note}</p>
          )}
        </div>

        {hasMore && (
          <Link
            href={buildUrl({ categoria: cat, page: 1, q })}
            className="group inline-flex shrink-0 items-center gap-2 border-b border-chocolate pb-1 text-caption font-medium text-chocolate transition hover:border-ember hover:text-ember"
          >
            Ver todos ({items.length})
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>

      <div className={GRID}>
        {previewItems.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

async function ProductosGrid({ categoria, page, q }) {
  const supabase = await createClient()

  const hasSearch = Boolean(q && q.trim().length > 0)
  const isAllView = categoria === 'Todos'
  const showGrouped = isAllView && !hasSearch

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_available', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (hasSearch) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  if (!isAllView) {
    query = query.eq('category', categoria)
  }

  if (!showGrouped) {
    query = query.range(from, to)
  }

  const { data: products, error, count } = await query

  if (error) {
    console.error('Error cargando productos:', error.message)
    return (
      <div className="border border-ember/25 bg-paper p-8 text-center">
        <p className="font-serif text-h3 text-chocolate">No pudimos cargar los productos</p>
        <p className="mt-2 text-caption text-caramel">
          Recargá la página en unos segundos. Si sigue igual, escribinos.
        </p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    if (hasSearch) {
      return (
        <div className="border border-sand/50 bg-paper px-6 py-20 text-center">
          <SearchX size={32} className="mx-auto mb-4 text-stone" />
          <p className="font-serif text-h3 text-chocolate">
            No encontramos productos con "{q}"
          </p>
          <p className="mt-2 text-caption text-caramel">
            Probá con otra palabra o revisá la ortografía.
          </p>
          <Link
            href={buildUrl({ categoria, page: 1 })}
            className="mt-6 inline-flex items-center gap-2 bg-chocolate px-5 py-3 text-caption font-medium text-cream transition hover:bg-ember"
          >
            Ver todo el catálogo
          </Link>
        </div>
      )
    }

    return (
      <div className="border border-sand/50 bg-paper px-6 py-20 text-center">
        <p className="font-serif text-h3 text-chocolate">
          Todavía no hay productos en esta categoría
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-flex items-center gap-2 bg-chocolate px-5 py-3 text-caption font-medium text-cream transition hover:bg-ember"
        >
          Ver todo el catálogo
        </Link>
      </div>
    )
  }

  const total = count || products.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const startNum = from + 1
  const endNum = Math.min(from + products.length, total)

  if (showGrouped) {
    const grouped = groupByCategory(products)
    return (
      <div className="space-y-20">
        {grouped.map(([cat, items]) => (
          <CategorySection key={cat} cat={cat} items={items} q={q} />
        ))}
      </div>
    )
  }

  return (
    <>
      {hasSearch && (
        <p className="mb-8 text-caption text-caramel">
          {total} {total === 1 ? 'resultado' : 'resultados'} para "{q}"
        </p>
      )}

      <div className={GRID}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <Pagination
        categoria={categoria}
        q={q}
        page={page}
        totalPages={totalPages}
        startNum={startNum}
        endNum={endNum}
        total={total}
      />
    </>
  )
}

export default async function ProductosPage({ searchParams }) {
  const params = await searchParams
  const categoria = params?.categoria || 'Todos'
  const page = Math.max(1, parseInt(params?.page || '1', 10) || 1)
  const q = params?.q || ''
  const hasSearch = Boolean(q && q.trim().length > 0)

  const current = CATEGORIES.find((c) => c.value === categoria) || CATEGORIES[0]
  const isAllView = categoria === 'Todos'

  // ═══════════════════════════════════════════════════════════
  // VISTA DE BÚSQUEDA → sin hero, resultados al toque
  // ═══════════════════════════════════════════════════════════
  if (hasSearch) {
    return (
      <div className="-mt-[6.75rem] min-h-screen bg-cream pt-[6.75rem]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-6">
            <Link
              href={buildUrl({ categoria })}
              className="mb-4 inline-flex items-center gap-1.5 text-caption text-caramel transition hover:text-chocolate"
            >
              <ArrowLeft size={13} /> Volver al catálogo
            </Link>
            <h1 className="font-serif text-h1 text-chocolate">
              Resultados de búsqueda
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-14">
            {/* Sidebar unificado (con sticky + combos) */}
            <ProductsSidebar categoria={categoria} q={q} />

            {/* Columna productos */}
            <div className="min-w-0 flex-1">
              <div className="mb-8">
                <ProductSearch categoria={categoria} />
              </div>

              {/* Pills categorías mobile */}
              <div className="-mx-4 mb-8 px-4 lg:hidden">
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                  {CATEGORIES.map((cat) => {
                    const active = categoria === cat.value
                    const Icon = cat.icon
                    return (
                      <Link
                        key={cat.value}
                        href={buildUrl({ categoria: cat.value, page: 1, q })}
                        aria-current={active ? 'page' : undefined}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-caption transition ${
                          active
                            ? 'border-chocolate bg-chocolate font-semibold text-cream'
                            : 'border-sand/60 bg-paper text-caramel hover:bg-beige'
                        }`}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <Suspense
                key={`${categoria}-${page}-${q}`}
                fallback={<GridSkeleton />}
              >
                <ProductosGrid categoria={categoria} page={page} q={q} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // VISTA NORMAL → hero sticky + cream sheet
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="relative">
      <section className="sticky top-0 z-0 -mt-[6.75rem] flex h-[46vh] items-center justify-center overflow-hidden pt-[6.75rem] sm:h-[54vh]">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=85"
          alt={`Productos ${SITE_CONFIG.businessName}`}
          fill
          priority
          sizes="100vw"
          className="animate-hero-zoom object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-mahogany/80 via-chocolate/55 to-chocolate/85" />

        <div className="animate-hero-rise relative z-10 mx-auto w-full max-w-3xl px-4 pb-10 text-center">
          <h1 className="font-serif text-h1 text-cream drop-shadow-lg sm:text-display">
            Nuestro catálogo
          </h1>
          <p className="mx-auto mt-4 max-w-md text-body text-cream/85">
            Elegí tus favoritos y retiralos frescos por el local.
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-8 min-h-screen rounded-t-[2rem] bg-cream pb-28 pt-12 shadow-[0_-24px_60px_-24px_rgb(18_4_2/0.6)] sm:-mt-12 sm:rounded-t-[3rem] sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="mb-10 flex flex-col gap-2 border-b border-sand/50 pb-8 sm:mb-14">
            <h2 className="font-serif text-h1 text-chocolate">
              {isAllView ? 'Todo el catálogo' : current.label}
            </h2>
            <p className="max-w-prose text-body text-caramel">{current.note}</p>
          </header>

          <div className="flex flex-col lg:flex-row lg:gap-14">
            {/* MOBILE: pills */}
            <div className="-mx-4 mb-8 px-4 lg:hidden">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => {
                  const active = categoria === cat.value
                  const Icon = cat.icon
                  return (
                    <Link
                      key={cat.value}
                      href={buildUrl({ categoria: cat.value, page: 1 })}
                      aria-current={active ? 'page' : undefined}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-caption transition ${
                        active
                          ? 'border-chocolate bg-chocolate font-semibold text-cream'
                          : 'border-sand/60 bg-paper text-caramel hover:bg-beige'
                      }`}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Sidebar unificado */}
            <ProductsSidebar categoria={categoria} q={q} />

            {/* Columna productos */}
            <div className="min-w-0 flex-1">
              <div className="mb-10">
                <ProductSearch categoria={categoria} />
              </div>

              <Suspense
                key={`${categoria}-${page}-${q}`}
                fallback={<GridSkeleton />}
              >
                <ProductosGrid categoria={categoria} page={page} q={q} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}