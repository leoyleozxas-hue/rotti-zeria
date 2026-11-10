// app/admin/lunch/page.jsx
import Link from 'next/link'
import { Plus, Briefcase, UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductsTable from '@/components/admin/ProductsTable'

export default async function LunchPage({ searchParams }) {
  const params = await searchParams
  const tipo = params?.tipo || 'Lunch'

  const supabase = await createClient()
  const { data: lunches } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lunch')
    .eq('lunch_type', tipo)
    .order('created_at', { ascending: false })

  // Contar ambos tipos para los badges
  const { count: lunchCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'Lunch')
    .eq('lunch_type', 'Lunch')

  const { count: eventoCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'Lunch')
    .eq('lunch_type', 'Evento')

  const tabs = [
    { value: 'Lunch', label: 'Lunch para oficinas', icon: Briefcase, count: lunchCount || 0 },
    { value: 'Evento', label: 'Eventos / Catering', icon: UtensilsCrossed, count: eventoCount || 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Lunch & Eventos</h1>
          <p className="text-white/60 text-sm mt-1">
            Gestioná los combos de oficina y los servicios de catering
          </p>
        </div>
        <Link
          href="/admin/lunch/nuevo"
          className="flex items-center justify-center gap-2 bg-gold-soft text-chocolate px-5 py-2.5 rounded-full font-semibold hover:bg-white transition"
        >
          <Plus size={18} /> Nuevo
        </Link>
      </div>

      {/* Tabs Lunch / Eventos */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tipo === tab.value
          const href = `/admin/lunch?tipo=${tab.value}`
          return (
            <Link
              key={tab.value}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
                active
                  ? 'bg-gold-soft text-chocolate border-gold-soft font-semibold'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-black/15 text-chocolate' : 'bg-white/10'
                }`}
              >
                {tab.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Aviso si está vacío */}
      {(!lunches || lunches.length === 0) && (
        <div className="rounded-card border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/50 text-sm mb-4">
            No hay {tipo === 'Evento' ? 'eventos / catering' : 'combos de lunch'} creados todavía.
          </p>
          <Link
            href="/admin/lunch/nuevo"
            className="inline-flex items-center gap-2 bg-gold-soft text-chocolate px-5 py-2.5 rounded-full font-semibold hover:bg-white transition text-sm"
          >
            <Plus size={16} /> Crear el primero
          </Link>
        </div>
      )}

      {lunches && lunches.length > 0 && (
        <ProductsTable products={lunches} />
      )}
    </div>
  )
}