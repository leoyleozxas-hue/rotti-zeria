// app/admin/productos/[id]/page.jsx
//
// Edición de producto. Este archivo estaba ocupado por una copia del detalle de
// pedido, así que el botón "Editar" de la grilla caía en un 404. Ahora monta
// ProductForm con los datos actuales.

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import PageHeader from '@/components/ui/page-header'

async function getProduct(id) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export default async function EditarProductoPage({ params }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title={product.name}
        description="Cambiá los datos y guardá. Lo que marques como oculto no aparece en la tienda."
        backHref="/admin/productos"
        backLabel="Volver a productos"
      />
      <ProductForm initialData={product} />
    </div>
  )
}
