// app/admin/lunch/[id]/page.jsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase, UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import LunchForm from '@/components/admin/LunchForm'

export default async function EditarLunchPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lunch } = await supabase.from('products').select('*').eq('id', id).single()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .neq('category', 'Lunch')
    .order('name')
  const { data: comboItems } = await supabase
    .from('combo_items')
    .select('*, products(name)')
    .eq('combo_id', id)

  if (!lunch) notFound()

  const tipo = lunch.lunch_type === 'Evento' ? 'Evento' : 'Lunch'
  const isEvento = tipo === 'Evento'
  const Icon = isEvento ? UtensilsCrossed : Briefcase
  const tipoLabel = isEvento ? 'Evento / Catering' : 'Lunch para oficinas'

  // Mapeamos los items de la base de datos al formato que espera el form
  const initialItems = (comboItems || []).map((item) => ({
    product_id: item.product_id,
    name: item.products?.name || '',
    quantity: item.quantity,
  }))

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/lunch?tipo=${tipo}`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} />
        Volver a {isEvento ? 'Eventos / Catering' : 'Lunch para oficinas'}
      </Link>

      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
            isEvento
              ? 'border-gold/40 bg-gold/15 text-gold-soft'
              : 'border-white/15 bg-white/5 text-white/70'
          }`}
        >
          <Icon size={18} aria-hidden />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold-soft/80">
            {tipoLabel}
          </p>
          <h1 className="font-serif text-3xl text-white">
            Editar {isEvento ? 'evento / catering' : 'lunch'}
          </h1>
          <p className="text-white/60 mt-1 text-sm">Modificando: {lunch.name}</p>
        </div>
      </div>

      <LunchForm
        initialData={{ ...lunch, combo_items: initialItems }}
        defaultTipo={tipo}
        allProducts={products || []}
      />
    </div>
  )
}