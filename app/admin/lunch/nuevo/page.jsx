// app/admin/lunch/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import LunchForm from '@/components/admin/LunchForm'

export default async function NuevoLunchPage() {
  const supabase = await createClient()
  // Traemos TODOS los productos (para poder agregarlos al combo)
  const { data: products } = await supabase.from('products').select('*').neq('category', 'Lunch').order('name')

  return (
    <div className="space-y-6">
      <Link href="/admin/lunch" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
        <ArrowLeft size={16} /> Volver a combos
      </Link>
      <h1 className="font-serif text-3xl text-white">Crear Nuevo Combo</h1>
      <LunchForm allProducts={products || []} />
    </div>
  )
}