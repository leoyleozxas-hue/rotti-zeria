// app/admin/categorias/[id]/page.jsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/admin/CategoryForm'

async function getCategory(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

async function getProductCount(categoryName) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', categoryName)
  return count || 0
}

export default async function EditarCategoriaPage({ params }) {
  const { id } = await params
  const category = await getCategory(id)
  if (!category) notFound()

  const productCount = await getProductCount(category.name)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft size={16} /> Volver a categorías
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-white">Editar categoría</h1>
        <p className="mt-1 text-sm text-white/60">Modificando: {category.name}</p>
      </div>
      <CategoryForm initialData={category} productCount={productCount} />
    </div>
  )
}