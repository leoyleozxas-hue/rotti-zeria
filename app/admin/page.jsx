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

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    {
      label: 'Pedidos totales',
      value: stats.total,
      icon: ShoppingBag,
      color: 'bg-chocolate text-cream',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'bg-gold text-chocolate',
    },
    {
      label: 'En preparación',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-caramel text-cream',
    },
    {
      label: 'Ingresos',
      value: `$${stats.revenue.toLocaleString('es-AR')}`,
      icon: DollarSign,
      color: 'bg-wood text-cream',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-chocolate">Dashboard</h1>
        <p className="text-caramel mt-1">Resumen general de la panadería</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`${card.color} rounded-2xl p-6 shadow-sm`}
            >
              <Icon size={24} className="mb-4 opacity-80" />
              <p className="text-3xl font-serif mb-1">{card.value}</p>
              <p className="text-sm opacity-80">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-chocolate">Pedidos recientes</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-caramel hover:text-chocolate transition"
          >
            Ver todos →
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="text-caramel text-sm py-8 text-center">
            Todavía no hay pedidos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-caramel border-b border-beige">
                  <th className="pb-3 font-normal">Nro.</th>
                  <th className="pb-3 font-normal">Cliente</th>
                  <th className="pb-3 font-normal">Total</th>
                  <th className="pb-3 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((order) => (
                  <tr key={order.id} className="border-b border-beige/50 last:border-0">
                    <td className="py-3 font-mono text-xs">{order.order_number}</td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="py-3 font-semibold">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3">
                      <span className="text-xs bg-beige px-2 py-1 rounded-full">
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