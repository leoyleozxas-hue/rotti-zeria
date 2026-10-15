import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OrderNotifications from '@/components/admin/OrderNotifications'

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  payment_review: 'Revisar pago',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS = {
  pending_payment: 'bg-amber-400/20 text-amber-100 border-amber-300/30',
  payment_review: 'bg-orange-400/20 text-orange-100 border-orange-300/30',
  confirmed: 'bg-sky-400/20 text-sky-100 border-sky-300/30',
  preparing: 'bg-violet-400/20 text-violet-100 border-violet-300/30',
  ready: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30',
  delivered: 'bg-white/15 text-white/80 border-white/20',
  cancelled: 'bg-red-400/20 text-red-100 border-red-300/30',
}

const glass = 'border border-white/25 bg-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.2)]'

async function getOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function PedidosPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <OrderNotifications />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-white">Pedidos</h1>
          <p className="text-white/65 mt-1">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={`${glass} p-12 text-center`}>
          <p className="text-white/65">Todavía no hay pedidos.</p>
        </div>
      ) : (
        <div className={`${glass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/10 text-white/60">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Nro.</th>
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium">Fecha pedido</th>
                  <th className="text-left px-5 py-3 font-medium">Total</th>
                  <th className="text-left px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/10 last:border-0 hover:bg-white/5 transition"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-white/85">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{order.customer_name}</p>
                      <p className="text-xs text-white/55">{order.customer_phone}</p>
                    </td>
                    <td className="px-5 py-4 text-white/60 text-xs">
                      {new Date(order.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          STATUS_COLORS[order.status] || 'bg-white/15 text-white/80 border-white/20'
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-[#E0C89A] hover:text-white text-sm transition"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
