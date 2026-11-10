// app/productos/[id]/page.jsx
import { Suspense, cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Clock, Wheat } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/config'
import AddToCartSection from '@/components/AddToCartSection'
import ProductCard from '@/components/ProductCard'
import ProductGallery from '@/components/ProductGallery'
import ShareButtons from '@/components/ShareButtons'

// ── Función cacheada: si dos componentes la llaman en el mismo request,
//    solo se ejecuta la query UNA vez ──
const getProduct = cache(async (id) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
})

async function ProductInfo({ id }) {
  const product = await getProduct(id)
  if (!product) notFound()

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
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:pb-28 lg:pt-12">
        {/* Ruta */}
        <nav
          aria-label="Ruta"
          className="mb-8 flex items-center gap-2 text-caption text-stone lg:mb-12"
        >
          <Link href="/productos" className="transition-colors hover:text-chocolate">
            Catálogo
          </Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link
            href={`/productos?categoria=${encodeURIComponent(product.category)}`}
            className="transition-colors hover:text-chocolate"
          >
            {product.category}
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Imagen: sticky en desktop */}
          <div className="lg:col-span-6 lg:self-start">
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-square overflow-hidden bg-beige shadow-lifted lg:aspect-[4/5]">
                <ProductGallery mainImage={product.image_url} gallery={gallery} />
              </div>
            </div>
          </div>

          {/* Ficha */}
          <div className="flex flex-col lg:col-span-6 lg:pt-4">
            <span className="mb-4 text-caption text-stone">{product.category}</span>

            <h1 className="font-serif text-h1 text-chocolate sm:text-display">
              {product.name}
            </h1>

            <p className="mt-6 font-serif text-h2 text-chocolate tabular">
              ${Number(product.price).toLocaleString('es-AR')}
            </p>

            <div className="mt-8 max-w-prose">
              <p className="text-body text-caramel">{mainDescription}</p>

              {listItems.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-3 font-serif text-h3 text-chocolate">Incluye</h2>
                  <ul className="divide-y divide-sand/40 border-y border-sand/40">
                    {listItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 py-3 text-caption text-caramel"
                      >
                        <span
                          className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                          aria-hidden="true"
                        />
                        <span className="text-[0.9375rem] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-10 border-t border-sand/50 pt-8">
              <AddToCartSection product={product} />
            </div>

            {product.category !== 'Lunch' && (
              <ul className="mt-10 space-y-5 border-t border-sand/50 pt-8">
                <li className="flex items-start gap-4">
                  <Wheat size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <p className="text-body font-semibold text-chocolate">100% artesanal</p>
                    <p className="text-caption text-caramel">Masa madre y fermentación lenta.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Clock size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <p className="text-body font-semibold text-chocolate">Horneado hoy</p>
                    <p className="text-caption text-caramel">Retirá fresco por el local.</p>
                  </div>
                </li>
              </ul>
            )}

            <div className="mt-10 border-t border-sand/50 pt-6">
              <ShareButtons
                productName={product.name}
                url={`${SITE_CONFIG.siteUrl}/productos/${product.id}`}
              />
            </div>
          </div>
        </div>
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
    <section className="border-t border-sand/40 bg-paper py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2 className="font-serif text-h2 text-chocolate sm:text-h1">
            También de {category}
          </h2>
          <Link
            href={`/productos?categoria=${encodeURIComponent(category)}`}
            className="hidden border-b border-chocolate pb-1 text-caption font-medium text-chocolate transition hover:border-ember hover:text-ember md:block"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
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
  const product = await getProduct(id)

  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params
  const product = await getProduct(id) // usa el cache, no repite query

  return (
    <main>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-cream text-caramel">
            Cargando...
          </div>
        }
      >
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