// app/productos/[id]/page.jsx
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Wheat, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AddToCartSection from '@/components/AddToCartSection'
import ProductCard from '@/components/ProductCard'

// Filtro CSS para que las fotos de Unsplash parezcan de estudio
const imageFilter = "contrast-[1.05] saturate-[1.1] brightness-[0.98]"

async function ProductInfo({ id }) {
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF7F2]">
      
      {/* Mitad Izquierda: Foto Inmensa */}
      <div className="w-full lg:w-3/5 relative min-h-[50vh] lg:min-h-screen bg-[#EADFC8]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            className={`object-cover ${imageFilter}`}
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9a8b7a]">
            Sin imagen
          </div>
        )}
        
        {/* Botón Volver flotante sobre la foto */}
        <Link
          href="/productos"
          className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-[#2B0F0B] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition shadow-lg"
        >
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Mitad Derecha: Información estilo Editorial */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 py-16 lg:px-20 lg:py-24">
        
        <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#9a8b7a] mb-6 block">
          {product.category}
        </span>
        
        <h1 className="font-serif text-5xl lg:text-7xl text-[#2B0F0B] leading-[1.05] mb-6">
          {product.name}
        </h1>
        
        <p className="text-lg text-gray-600 font-light leading-relaxed mb-10 max-w-md">
          {product.description}
        </p>

        <div className="flex items-end gap-4 mb-10">
          <span className="font-serif text-4xl text-[#2B0F0B]">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
        </div>

        <div className="border-t border-[#EADFC8] pt-10">
          <AddToCartSection product={product} />
        </div>

        {/* Sellos de calidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 pt-8 border-t border-[#EADFC8]">
          <div className="flex items-start gap-3">
            <Wheat size={20} className="text-[#C9A96E] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#2B0F0B]">100% Artesanal</p>
              <p className="text-xs text-gray-500 mt-1">Masa madre y fermentación lenta.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-[#C9A96E] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#2B0F0B]">Horneado hoy</p>
              <p className="text-xs text-gray-500 mt-1">Retirá fresco por el local.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Sección de relacionados con scroll horizontal
async function RelatedProducts({ category, excludeId }) {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('category', category)
    .neq('id', excludeId)
    .limit(4)

  if (!products || products.length === 0) return null

  return (
    <section className="bg-[#FAF7F2] py-20 border-t border-[#EADFC8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#9a8b7a] block mb-2">
              Descubrí más
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#2B0F0B]">
              También de {category}
            </h2>
          </div>
          <Link href={`/productos?categoria=${encodeURIComponent(category)}`} className="hidden md:block text-sm font-medium text-[#2B0F0B] border-b border-[#2B0F0B] pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition">
            Ver todos
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Producto no encontrado | Biarritz' }

  return {
    title: `${product.name} | Biarritz`,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('category')
    .eq('id', id)
    .single()

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#2B0F0B]">Cargando...</div>}>
        <ProductInfo id={id} />
      </Suspense>

      {product && (
        <Suspense fallback={null}>
          <RelatedProducts category={product.category} excludeId={id} />
        </Suspense>
      )}
    </main>
  )
}