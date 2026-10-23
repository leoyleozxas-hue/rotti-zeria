// app/admin/pedidos/page.jsx
import { createClient } from '@/lib/supabase/server'
import OrderNotifications from '@/components/admin/OrderNotifications'
import OrdersBoard from '@/components/admin/OrdersBoard'
import PageHeader from '@/components/ui/page-header'

async function getOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        id, quantity, product_name
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data || []
}

export default async function PedidosPage() {
  const orders = await getOrders()

  return (
    <div className="w-full max-w-full space-y-6">
      <OrderNotifications />
      <PageHeader
        eyebrow="Operación"
        title="Pedidos"
        description="El flujo completo: desde el pago pendiente hasta la entrega. Los nuevos se avisan solos."
      />
      <OrdersBoard initialOrders={orders} />
    </div>
  )
}
