// app/admin/pedidos/page.jsx
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
  pending_payment: 'bg-yellow-100 text-yellow-800',
  payment_review: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

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
    <div className="space-y-6">
      <OrderNotifications />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-chocolate">Pedidos</h1>
          <p className="text-caramel mt-1">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-caramel">Todavía no hay pedidos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-beige text-caramel">
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
                    className="border-b border-beige/50 last:border-0 hover:bg-beige/30 transition"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-chocolate">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-chocolate font-medium">{order.customer_name}</p>
                      <p className="text-xs text-caramel">{order.customer_phone}</p>
                    </td>
                    <td className="px-5 py-4 text-caramel text-xs">
                      {new Date(order.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-chocolate">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-caramel hover:text-chocolate text-sm transition"
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