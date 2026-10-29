// app/admin/lunch/[id]/page.jsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import LunchForm from '@/components/admin/LunchForm'

export default async function EditarLunchPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: lunch } = await supabase.from('products').select('*').eq('id', id).single()
  const { data: products } = await supabase.from('products').select('*').neq('category', 'Lunch').order('name')
  const { data: comboItems } = await supabase.from('combo_items').select('*, products(name)').eq('combo_id', id)

  if (!lunch) notFound()

  // Mapeamos los items de la base de datos al formato que espera el form
  const initialItems = (comboItems || []).map(item => ({
    product_id: item.product_id,
    name: item.products.name,
    quantity: item.quantity
  }))

  return (
    <div className="space-y-6">
      <Link href="/admin/lunch" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
        <ArrowLeft size={16} /> Volver a combos
      </Link>
      <h1 className="font-serif text-3xl text-white">Editar Combo</h1>
      <LunchForm initialData={{ ...lunch, combo_items: initialItems }} allProducts={products || []} />
    </div>
  )
}