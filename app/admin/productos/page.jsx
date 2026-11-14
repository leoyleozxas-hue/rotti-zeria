// app/admin/productos/page.jsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductsTable from '@/components/admin/ProductsTable'
import PageHeader from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import { getAllCategories } from '@/lib/categories'

async function getProducts(categoria) {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').order('name', { ascending: true })
  if (categoria) query = query.eq('category', categoria)
  const { data, error } = await query
  if (error) return []
  return data || []
}

export default async function AdminProductosPage({ searchParams }) {
  const params = await searchParams
  const allCategories = await getAllCategories()

  const categoriaParam = params?.categoria
  const categoria = allCategories.some((c) => c.name === categoriaParam)
    ? categoriaParam
    : null

  const products = await getProducts(categoria)

  const chipBase =
    'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition'

  return (
    <div className="w-full max-w-full space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title={categoria ? `Productos · ${categoria}` : 'Productos'}
        description={`${products.length} ${products.length === 1 ? 'producto' : 'productos'} en el catálogo. Lo que esté oculto no se ve en la tienda.`}
        actions={
          <ButtonLink href="/admin/productos/nuevo" variant="primary" size="md">
            <Plus size={16} aria-hidden />
            Nuevo producto
          </ButtonLink>
        }
      />

      <nav aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
        <Link
          href="/admin/productos"
          aria-current={!categoria ? 'page' : undefined}
          className={`${chipBase} ${
            !categoria
              ? 'border-gold/45 bg-gold/15 font-semibold text-gold-soft'
              : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white'
          }`}
        >
          Todos
        </Link>
        {allCategories.map((cat) => {
          const active = categoria === cat.name
          return (
            <Link
              key={cat.id}
              href={`/admin/productos?categoria=${encodeURIComponent(cat.name)}`}
              aria-current={active ? 'page' : undefined}
              className={`${chipBase} ${
                active
                  ? 'border-gold/45 bg-gold/15 font-semibold text-gold-soft'
                  : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white'
              }`}
            >
              {cat.name}
              {!cat.is_active && (
                <span className="ml-1.5 text-[9px] uppercase tracking-wider text-white/30">
                  oculta
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <ProductsTable products={products} />
    </div>
  )
}