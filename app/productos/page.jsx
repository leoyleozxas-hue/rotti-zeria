// app/productos/page.jsx
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'

const woodCatalog = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.85), rgba(18,4,2,.90)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed', // <-- ESTO HACE EL PARALLAX
}

const CATEGORIES = [
  { value: 'Todos', label: 'Todos los productos' },
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
    .neq('category', 'Lunch')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (categoria && categoria !== 'Todos') {
    query = query.eq('category', categoria)
  }

  const { data: products, error } = await query

  if (error) {
    return <p className="text-red-300 bg-red-900/50 p-4 rounded-lg">Error: {error.message}</p>
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-6">
        <p className="text-white text-lg">No hay productos en esta categoría.</p>
        <Link href="/productos" className="text-[#E0C89A] hover:text-white mt-4 inline-block underline">
          Ver todo
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {products.map((p, index) => (
          <div 
            key={p.id} 
            className="anim-rise" 
            style={{ animationDelay: `${index * 80}ms` }} // Efecto cascada
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      
      <div className="text-center border-t border-white/10 pt-8 pb-4">
        <p className="text-[#E0C89A] text-sm font-medium uppercase tracking-wider">
          Mostrando {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>
    </>
  )
}

export default async function ProductosPage({ searchParams }) {
  const params = await searchParams
  const categoria = params?.categoria || 'Todos'

  return (
    <>
      {/* Hero más Editorial y con color */}
      <section className="relative flex items-center justify-center min-h-[45vh] -mt-[4.25rem] pt-[4.25rem] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=85"
          alt="Productos Biarritz"
          fill
          priority
          className="object-cover object-center scale-105 animate-[hero-zoom_1.4s_ease-out_both]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#150604]/90 via-[#3a130d]/70 to-[#C9A96E]/40" />
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center anim-rise">
          <span className="text-[#E0C89A] text-xs uppercase tracking-[0.3em] font-bold mb-4 block">
            Elaboración Artesanal
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 drop-shadow-xl">
            Nuestro Catálogo
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light max-w-xl mx-auto mb-8">
            Descubrí el sabor de lo hecho a mano. Elegí tus favoritos y retiralos frescos por el local.
          </p>
          <div className="w-24 h-px bg-[#E0C89A] mx-auto"></div>
        </div>
      </section>

      {/* Catálogo con Sidebar */}
      <section style={woodCatalog} className="py-12 min-h-screen bg-parallax">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filtros */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl sticky top-24 border border-white/40">
                <h2 className="font-serif text-xl text-[#2B0F0B] mb-4 border-b border-gray-200 pb-3">
                  Categorías
                </h2>
                <ul className="space-y-1.5">
                  {CATEGORIES.map((cat) => {
                    const active = categoria === cat.value
                    const href = cat.value === 'Todos' ? '/productos' : `/productos?categoria=${encodeURIComponent(cat.value)}`
                    return (
                      <li key={cat.value}>
                        <Link
                          href={href}
                          className={`block px-4 py-2.5 rounded-xl text-sm transition-all ${
                            active
                              ? 'bg-[#2B0F0B] text-white font-semibold shadow-md transform scale-[1.02]'
                              : 'text-gray-600 hover:bg-[#EADFC8] hover:text-[#2B0F0B]'
                          }`}
                        >
                          {cat.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </aside>

            {/* Grid de Productos */}
            <div className="flex-1">
              <Suspense fallback={<p className="text-white/70 animate-pulse">Cargando productos...</p>}>
                <ProductosGrid categoria={categoria} />
              </Suspense>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}