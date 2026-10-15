// app/admin/page.jsx
import Link from 'next/link'
import { ShoppingBag, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('status, total, created_at')

  if (!orders) return { total: 0, pending: 0, confirmed: 0, revenue: 0, recent: [] }

  const pending = orders.filter((o) =>
    ['pending_payment', 'payment_review'].includes(o.status)
  ).length

  const confirmed = orders.filter((o) =>
    ['confirmed', 'preparing', 'ready'].includes(o.status)
  ).length

  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + Number(o.total), 0)

  const { data: recent } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return { total: orders.length, pending, confirmed, revenue, recent: recent || [] }
}

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  payment_review: 'Revisar pago',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const glass = 'border border-white/25 bg-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.2)]'

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Pedidos totales', value: stats.total, icon: ShoppingBag },
    { label: 'Pendientes', value: stats.pending, icon: Clock },
    { label: 'En preparación', value: stats.confirmed, icon: CheckCircle },
    {
      label: 'Ingresos',
      value: `$${stats.revenue.toLocaleString('es-AR')}`,
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-8 text-[#F5EDE3]">
      <div>
        <h1 className="font-serif text-4xl text-white">Dashboard</h1>
        <p className="text-white/65 mt-1">Resumen general de la panadería</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`${glass} p-6`}>
              <Icon size={24} className="mb-4 text-[#E0C89A]" />
              <p className="text-3xl font-serif text-white mb-1">{card.value}</p>
              <p className="text-sm text-white/65">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className={`${glass} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-white">Pedidos recientes</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-[#E0C89A] hover:text-white transition"
          >
            Ver todos →
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="text-white/60 text-sm py-8 text-center">
            Todavía no hay pedidos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/55 border-b border-white/15">
                  <th className="pb-3 font-normal">Nro.</th>
                  <th className="pb-3 font-normal">Cliente</th>
                  <th className="pb-3 font-normal">Total</th>
                  <th className="pb-3 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((order) => (
                  <tr key={order.id} className="border-b border-white/10 last:border-0">
                    <td className="py-3 font-mono text-xs text-white/80">{order.order_number}</td>
                    <td className="py-3 text-white/90">{order.customer_name}</td>
                    <td className="py-3 font-semibold text-white">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3">
                      <span className="text-xs bg-white/15 border border-white/20 px-2 py-1 rounded-full text-white/80">
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
