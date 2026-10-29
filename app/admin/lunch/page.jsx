// app/admin/lunch/page.jsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductsTable from '@/components/admin/ProductsTable' // Reutilizamos la tabla

export default async function LunchPage() {
  const supabase = await createClient()
  const { data: lunches } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lunch')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Lunch & Eventos</h1>
          <p className="text-white/60 text-sm mt-1">Gestioná los combos y servicios de catering</p>
        </div>
        <Link href="/admin/lunch/nuevo" className="flex items-center justify-center gap-2 bg-gold-soft text-chocolate px-5 py-2.5 rounded-full font-semibold hover:bg-white transition">
          <Plus size={18} /> Nuevo Combo
        </Link>
      </div>
      
      {/* Usamos la tabla, pero los links de "Editar" van a ir a /admin/lunch/[id] */}
      <ProductsTable products={lunches || []} editPath="/admin/lunch" />
    </div>
  )
}