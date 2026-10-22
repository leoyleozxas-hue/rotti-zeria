// app/admin/pedidos/page.jsx
import { createClient } from '@/lib/supabase/server'
import OrderNotifications from '@/components/admin/OrderNotifications'
import OrdersTable from '@/components/admin/OrdersTable'

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <OrderNotifications />
      <div>
        <h1 className="font-serif text-4xl text-white">Pedidos</h1>
      </div>
      <OrdersTable orders={orders || []} />
    </div>
  )
}