// app/productos/[id]/page.jsx
import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Wheat } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/config'
import AddToCartSection from '@/components/AddToCartSection'
import ProductCard from '@/components/ProductCard'
import ProductGallery from '@/components/ProductGallery'
import ShareButtons from '@/components/ShareButtons'

async function ProductInfo({ id }) {
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  // Descripción: 1er bloque = párrafo, resto = ítems de la lista
  const rawLines = (product.description || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '')

  const hasListItems = rawLines.length > 1
  const mainDescription = hasListItems ? rawLines[0] : product.description
  const listItems = hasListItems ? rawLines.slice(1) : []

  const gallery = Array.isArray(product.gallery) ? product.gallery : []

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF7F2]">

      {/* Columna imagen (50%) — tarjeta centrada y contenida */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center bg-[#FAF7F2] p-4 lg:p-10">

        <Link
          href="/productos"
          className="absolute top-4 left-4 lg:top-8 lg:left-8 z-20 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-[#2B0F0B] px-4 py-2 rounded-full text-xs font-medium hover:bg-white transition shadow-lg"
        >
          <ArrowLeft size={14} /> Volver
        </Link>

        {/* Tarjeta de imagen: cuadrada en mobile, 4:5 en desktop, max 460px */}
        <div className="relative w-full lg:max-w-[460px] aspect-square lg:aspect-[4/5] lg:rounded-2xl overflow-hidden lg:shadow-2xl bg-[#EADFC8]">
          <ProductGallery mainImage={product.image_url} gallery={gallery} />
        </div>
      </div>

      {/* Columna contenido (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 lg:px-14 xl:px-20 lg:py-16">
        <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#9a8b7a] mb-4 block">
          {product.category}
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#2B0F0B] leading-[1.05] mb-6">
          {product.name}
        </h1>

        <div className="mb-8 max-w-xl">
          <p className="text-base lg:text-lg text-gray-600 font-light leading-relaxed">
            {mainDescription}
          </p>

          {listItems.length > 0 && (
            <ul className="space-y-1.5 mt-5">
              {listItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="text-[#C9A96E] mt-2 shrink-0">
                    <svg width="5" height="5" viewBox="0 0 6 6" fill="currentColor">
                      <circle cx="3" cy="3" r="3" />
                    </svg>
                  </span>
                  <span className="text-gray-600 font-light leading-relaxed text-sm lg:text-[15px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-end gap-4 mb-6">
          <span className="font-serif text-3xl lg:text-4xl text-[#2B0F0B]">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
        </div>

        <div className="border-t border-[#EADFC8] pt-6">
          <AddToCartSection product={product} />
        </div>

        <div className="mt-6 pt-6 border-t border-[#EADFC8]">
          <ShareButtons
            productName={product.name}
            url={`${SITE_CONFIG.siteUrl}/productos/${product.id}`}
          />
        </div>

        {product.category !== 'Lunch' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 pt-6 border-t border-[#EADFC8]">
            <div className="flex items-start gap-3">
              <Wheat size={18} className="text-[#C9A96E] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#2B0F0B]">100% Artesanal</p>
                <p className="text-xs text-gray-500 mt-1">Masa madre y fermentación lenta.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-[#C9A96E] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#2B0F0B]">Horneado hoy</p>
                <p className="text-xs text-gray-500 mt-1">Retirá fresco por el local.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
    <section className="bg-[#EADFC8] py-20 border-t border-[#9a8b7a]/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#6b3a2c] block mb-2">
              Descubrí más
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#2B0F0B]">
              También de {category}
            </h2>
          </div>
          <Link
            href={`/productos?categoria=${encodeURIComponent(category)}`}
            className="hidden md:block text-sm font-medium text-[#2B0F0B] border-b border-[#2B0F0B] pb-1 hover:text-[#6b3a2c] hover:border-[#6b3a2c] transition"
          >
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

  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.name,
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