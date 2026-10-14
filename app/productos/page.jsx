// app/productos/page.jsx
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'

const CATEGORIES = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Panes', label: 'Panes' },
  { value: 'Facturas', label: 'Facturas' },
  { value: 'Dulces', label: 'Dulces' },
  { value: 'Salados', label: 'Salados' },
  { value: 'Bocados calientes', label: 'Bocados calientes' },
]

async function ProductosGrid({ categoria }) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (categoria && categoria !== 'Todos') {
    query = query.eq('category', categoria)
  }

  const { data: products, error } = await query

  if (error) {
    return <p className="text-red-600">Error: {error.message}</p>
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-caramel text-lg">No hay productos en esta categoría.</p>
        <Link href="/productos" className="text-chocolate border-b-2 border-gold pb-1 mt-4 inline-block hover:text-gold transition">
          Ver todo
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="text-caramel text-sm mb-6">
        {products.length} {products.length === 1 ? 'producto' : 'productos'}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}

export default async function ProductosPage({ searchParams }) {
  const params = await searchParams
  const categoria = params?.categoria || 'Todos'

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <span className="text-gold uppercase tracking-[0.3em] text-xs">Catálogo</span>
        <h1 className="font-serif text-5xl text-chocolate mt-3 mb-3">Nuestros productos</h1>
        <p className="text-caramel">Todo hecho a mano, todos los días</p>
      </div>

      {/* Filtros */}
      <div className="mb-10 overflow-x-auto">
        <div className="flex gap-2 justify-start md:justify-center pb-2 min-w-max md:min-w-0">
          {CATEGORIES.map((cat) => {
            const active = categoria === cat.value
            const href = cat.value === 'Todos' ? '/productos' : `/productos?categoria=${encodeURIComponent(cat.value)}`
            return (
              <Link
                key={cat.value}
                href={href}
                className={`px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition border ${
                  active
                    ? 'bg-chocolate text-cream border-chocolate'
                    : 'bg-white text-caramel border-beige hover:border-gold hover:text-chocolate'
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>
      </div>

      <Suspense fallback={<p className="text-caramel">Cargando productos...</p>}>
        <ProductosGrid categoria={categoria} />
      </Suspense>
    </main>
  )
}