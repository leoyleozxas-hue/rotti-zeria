// app/admin/productos/[id]/page.jsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

async function getProduct(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function EditarProductoPage({ params }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        Volver a productos
      </Link>

      <div>
        <h1 className="font-serif text-3xl text-white">Editar producto</h1>
        <p className="text-white/60 mt-1 text-sm">Modificando: {product.name}</p>
      </div>

      <ProductForm initialData={product} />
    </div>
  )
}