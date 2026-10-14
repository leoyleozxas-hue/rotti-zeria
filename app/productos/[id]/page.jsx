// app/productos/[id]/page.jsx
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Wheat } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'

// ---------- Info del producto ----------
async function ProductInfo({ id }) {
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  return (
    <>
      <Link
        href="/productos"
        className="inline-flex items-center gap-2 text-caramel hover:text-chocolate transition mb-8 text-sm"
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mb-20">
        {/* Imagen */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-beige shadow-lg">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-caramel/40">
              Sin imagen
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <span className="text-gold uppercase tracking-[0.3em] text-xs mb-3">
            {product.category}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-chocolate mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="text-caramel leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="flex items-end gap-4 mb-8">
            <span className="font-serif text-4xl text-chocolate">
              ${Number(product.price).toLocaleString('es-AR')}
            </span>
            <span className="text-caramel text-sm mb-1">por unidad</span>
          </div>

          <AddToCartSection product={product} />

          <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-beige">
            <div className="flex items-center gap-3 text-sm text-caramel">
              <Wheat size={18} className="text-gold flex-shrink-0" />
              <span>Elaboración artesanal</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-caramel">
              <Clock size={18} className="text-gold flex-shrink-0" />
              <span>Horneado del día</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------- También te interesa ----------
async function RelatedProducts({ category, excludeId }) {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('category', category)
    .neq('id', excludeId)
    .limit(3)

  if (!products || products.length === 0) return null

  return (
    <section className="border-t border-beige pt-16">
      <div className="mb-10">
        <span className="text-gold uppercase tracking-[0.3em] text-xs">
          También te puede interesar
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-chocolate mt-3">
          Más de {category}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

// ---------- Metadata dinámica ----------
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

// ---------- Página ----------
export default async function ProductDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('category')
    .eq('id', id)
    .single()

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Suspense fallback={<p className="text-caramel">Cargando...</p>}>
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