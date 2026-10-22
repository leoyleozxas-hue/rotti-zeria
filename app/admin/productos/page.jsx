// app/admin/productos/page.jsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductsTable from '@/components/admin/ProductsTable'

async function getProducts(categoria) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (categoria && categoria !== 'Todos') {
    query = query.eq('category', categoria)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

export default async function AdminProductosPage({ searchParams }) {
  const params = await searchParams
  const categoria = params?.categoria || null
  const products = await getProducts(categoria)

  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl text-white">
            Productos {categoria ? `— ${categoria}` : ''}
          </h1>
          <p className="text-white/65 mt-1">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} en el catálogo
          </p>
        </div>
        
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-[#E0C89A] text-[#2b0f0b] px-5 py-2.5 rounded-full font-semibold hover:bg-white transition shadow-md"
        >
          <Plus size={18} />
          Nuevo producto
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  )
}