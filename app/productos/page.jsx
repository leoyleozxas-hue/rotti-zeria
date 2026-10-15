// app/productos/page.jsx
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'

const woodVertical = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.45), rgba(18,4,2,.65)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const woodCatalog = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.62), rgba(18,4,2,.72)), url('/images/textura-madera.png')",
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
    return <p className="text-red-300">Error: {error.message}</p>
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 border border-white/20 bg-white/10 backdrop-blur-md px-6">
        <p className="text-white/80 text-lg">No hay productos en esta categoría.</p>
        <Link
          href="/productos"
          className="text-[#E0C89A] border-b border-[#E0C89A] pb-1 mt-4 inline-block hover:text-white hover:border-white transition"
        >
          Ver todo
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="text-white/70 text-sm mb-6">
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
    <>
      <section style={woodVertical} className="text-white -mt-16 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Nuestros productos</h1>
          <p className="text-white/80">Todo hecho a mano, todos los días</p>
        </div>
      </section>

      <section style={woodCatalog} className="py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 overflow-x-auto">
            <div className="flex gap-2 justify-start md:justify-center pb-2 min-w-max md:min-w-0">
              {CATEGORIES.map((cat) => {
                const active = categoria === cat.value
                const href =
                  cat.value === 'Todos'
                    ? '/productos'
                    : `/productos?categoria=${encodeURIComponent(cat.value)}`
                return (
                  <Link
                    key={cat.value}
                    href={href}
                    className={`px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition border backdrop-blur-md ${
                      active
                        ? 'bg-white/25 text-white border-white/50'
                        : 'bg-white/10 text-white/75 border-white/20 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <Suspense fallback={<p className="text-white/70">Cargando productos...</p>}>
            <ProductosGrid categoria={categoria} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
