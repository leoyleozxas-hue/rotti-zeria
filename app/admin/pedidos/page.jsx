// app/admin/pedidos/page.jsx
import { createClient } from '@/lib/supabase/server'
import OrderNotifications from '@/components/admin/OrderNotifications'
import OrdersBoard from '@/components/admin/OrdersBoard' // <-- Nuevo componente

async function getOrders() {
  const supabase = await createClient()
  // TRUCO: Traemos los pedidos y sus items en una sola consulta
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, product_name
      )
    `)
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
    <div className="space-y-6 text-[#F5EDE3] w-full max-w-full">
      <OrderNotifications />
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white">Tablero de Pedidos</h1>
        <p className="text-white/65 mt-1 text-sm">Gestioná el flujo de la cocina en tiempo real.</p>
      </div>
      <OrdersBoard initialOrders={orders} />
    </div>
  )
}