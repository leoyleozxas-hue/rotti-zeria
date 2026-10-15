// app/admin/page.jsx
import Link from 'next/link'
import { Clock, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  payment_review: 'Revisar pago',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

// Panel de vidrio con brillo superior
const glass =
  'relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]'

async function getStats() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total, created_at')

  if (!orders) return null

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 6)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filterByRange = (from, to) =>
    orders.filter((o) => {
      const d = new Date(o.created_at)
      return d >= from && (!to || d < to)
    })

  const compute = (list) => ({
    count: list.length,
    revenue: list
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + Number(o.total), 0),
  })

  return {
    today: compute(filterByRange(startOfToday)),
    yesterday: compute(filterByRange(startOfYesterday, startOfToday)),
    week: compute(filterByRange(startOfWeek)),
    month: compute(filterByRange(startOfMonth)),
    pending: orders.filter((o) =>
      ['pending_payment', 'payment_review'].includes(o.status)
    ).length,
    recent: [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6),
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  if (!stats) return <p className="text-white/70">Cargando...</p>

  const ranges = [
    { label: 'Hoy', data: stats.today },
    { label: 'Ayer', data: stats.yesterday },
    { label: 'Últimos 7 días', data: stats.week },
    { label: 'Este mes', data: stats.month },
  ]

  return (
    <div className="space-y-8 text-[#F5EDE3] max-w-6xl">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl text-white">Dashboard</h1>
        <p className="text-white/60 mt-2">Resumen general de la panadería</p>
      </div>

      {/* Alerta de pendientes */}
      {stats.pending > 0 && (
        <Link
          href="/admin/pedidos"
          className="block border border-amber-300/40 bg-gradient-to-r from-amber-400/20 to-amber-400/5 backdrop-blur-xl p-5 rounded-2xl hover:from-amber-400/30 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,.15)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-amber-400/25 border border-amber-300/40 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-amber-100" />
            </div>
            <div>
              <p className="text-amber-50 font-medium">
                {stats.pending}{' '}
                {stats.pending === 1 ? 'pedido pendiente' : 'pedidos pendientes'} de
                revisar
              </p>
              <p className="text-amber-100/70 text-sm mt-0.5">
                Click para ir a la lista
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Cajas por rango */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ranges.map((r) => (
          <div key={r.label} className={`${glass} rounded-2xl p-5`}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#E0C89A] mb-4">
              {r.label}
            </p>
            <p className="font-serif text-4xl text-white leading-none">
              {r.data.count}
            </p>
            <p className="text-xs text-white/50 mt-1.5 mb-4">
              {r.data.count === 1 ? 'pedido' : 'pedidos'}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-white/80 pt-3 border-t border-white/10">
              <DollarSign size={14} className="text-[#E0C89A]" />
              <span className="font-medium">
                ${r.data.revenue.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Últimos pedidos */}
      <div className={`${glass} rounded-2xl overflow-hidden`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <h2 className="font-serif text-xl text-white">Últimos pedidos</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-[#E0C89A] hover:text-white transition"
          >
            Ver todos →
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="text-white/55 text-sm py-12 text-center">
            Todavía no hay pedidos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left text-white/50">
                  <th className="px-6 py-3 font-normal text-xs uppercase tracking-wider">
                    Nro.
                  </th>
                  <th className="px-6 py-3 font-normal text-xs uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 font-normal text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 font-normal text-xs uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((order, index) => (
                  <tr
                    key={order.id || `order-${index}`}
                    className="border-t border-white/8 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#E0C89A]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-white/90">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-white/10 border border-white/15 px-2.5 py-1 rounded-full text-white/75">
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