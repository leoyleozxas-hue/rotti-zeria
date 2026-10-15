// app/admin/pedidos/page.jsx
import { createClient } from '@/lib/supabase/server'
import OrderNotifications from '@/components/admin/OrderNotifications'
import OrdersTable from '@/components/admin/OrdersTable'

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

      <div>
        <h1 className="font-serif text-4xl text-white">Pedidos</h1>
        <p className="text-white/65 mt-1">
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}