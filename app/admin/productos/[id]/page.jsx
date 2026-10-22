// app/admin/pedidos/[id]/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Truck, User, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import OrderStatusPanel from '@/components/admin/OrderStatusPanel'
import PrintButton from '@/components/admin/PrintButton'

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
  pending_payment: 'bg-amber-400/20 text-amber-100 border-amber-300/40',
  payment_review: 'bg-orange-400/20 text-orange-100 border-orange-300/40',
  confirmed: 'bg-sky-400/20 text-sky-100 border-sky-300/40',
  preparing: 'bg-violet-400/20 text-violet-100 border-violet-300/40',
  ready: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40',
  delivered: 'bg-white/15 text-white/80 border-white/25',
  cancelled: 'bg-red-400/20 text-red-100 border-red-300/40',
}

const glass =
  'relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]'

async function getOrder(id) {
  const supabase = await createClient()

  // 1. Buscamos el pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError || !order) return null

  // 2. Buscamos los items del pedido
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (itemsError) {
    console.error('ERROR AL TRAER ITEMS:', itemsError)
    return { order, items: [] }
  }

  // DEBUG: Ver en la terminal qué está trayendo la DB
  console.log('--- DEBUG PEDIDO ---')
  console.log('Items crudos de la DB:', items)

  // 3. Extraemos los IDs de los productos para buscar sus nombres reales
  let productMap = {}
  if (items && items.length > 0) {
    const productIds = items.map(i => i.product_id).filter(Boolean)
    
    if (productIds.length > 0) {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds)

      console.log('Productos encontrados en la DB:', products)

      if (products) {
        productMap = Object.fromEntries(products.map(p => [p.id, p]))
      }
    }
  }

  // 4. Unimos todo con validación estricta
  const enrichedItems = (items || []).map((item) => {
    const fallbackProduct = item.product_id ? productMap[item.product_id] : null
    
    // Validamos que el nombre guardado no sea nulo ni un texto de error
    let finalName = item.product_name
    if (!finalName || finalName === 'Producto sin nombre' || finalName === 'Producto eliminado') {
      finalName = fallbackProduct?.name
    }
    
    return {
      ...item,
      display_name: finalName || 'Producto eliminado',
      display_image: item.product_image || fallbackProduct?.image_url || null,
    }
  })

  return { order, items: enrichedItems }
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params
  const data = await getOrder(id)

  if (!data) notFound()

  const { order, items } = data

  const createdAt = new Date(order.created_at).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const pickupDate = order.pickup_date
    ? new Date(order.pickup_date + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long', day: '2-digit', month: 'long',
      })
    : null

  return (
    <div className="space-y-6 text-[#F5EDE3] max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} /> Volver a pedidos
        </Link>
        <PrintButton />
      </div>

      {/* Cabecera */}
      <div className={`${glass} rounded-2xl p-6`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E0C89A] mb-2">
              Pedido
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-mono tracking-tight">
              {order.order_number}
            </h1>
            <p className="text-white/50 text-sm mt-2 flex items-center gap-2">
              <Clock size={13} /> {createdAt}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
              STATUS_COLORS[order.status] || 'bg-white/15 text-white/80 border-white/25'
            }`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Cliente + Entrega */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${glass} rounded-2xl p-6 space-y-3`}>
          <h2 className="font-serif text-lg text-white mb-4 flex items-center gap-2">
            <User size={16} className="text-[#E0C89A]" /> Cliente
          </h2>
          <p className="text-white font-medium text-lg">{order.customer_name}</p>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Phone size={14} className="text-[#E0C89A] shrink-0" />
            {order.customer_phone}
          </div>
          {order.customer_email && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Mail size={14} className="text-[#E0C89A] shrink-0" />
              {order.customer_email}
            </div>
          )}
        </div>

        <div className={`${glass} rounded-2xl p-6 space-y-3`}>
          <h2 className="font-serif text-lg text-white mb-4 flex items-center gap-2">
            <Truck size={16} className="text-[#E0C89A]" /> Entrega
          </h2>
          <p className="text-white font-medium">
            {order.delivery_type === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}
          </p>
          {order.address && (
            <div className="flex items-start gap-2 text-sm text-white/70">
              <MapPin size={14} className="text-[#E0C89A] mt-0.5 shrink-0" />
              <span>{order.address}</span>
            </div>
          )}
          {pickupDate && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Calendar size={14} className="text-[#E0C89A] shrink-0" />
              <span className="capitalize">{pickupDate}</span>
              {order.pickup_time && <span>· {order.pickup_time}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className={`${glass} rounded-2xl overflow-hidden`}>
        <div className="p-6 border-b border-white/10">
          <h2 className="font-serif text-lg text-white">
            Productos ({items.length})
          </h2>
        </div>

        {items.length === 0 ? (
          <p className="text-white/55 text-sm py-12 text-center">
            No hay items registrados en este pedido.
          </p>
        ) : (
          <div className="divide-y divide-white/8">
            {items.map((item, index) => (
              <div key={item.id || `item-${index}`} className="p-5 flex items-center gap-4">
                {item.display_image ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/8 border border-white/10 shrink-0">
                    <Image
                      src={item.display_image}
                      alt={item.display_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/20 text-xs">
                    Sin foto
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-lg">
                    {item.display_name}
                  </p>
                  <p className="text-sm text-white/55 mt-0.5">
                    {item.quantity} unidades × ${Number(item.unit_price).toLocaleString('es-AR')}
                  </p>
                </div>
                <span className="text-white font-bold text-xl whitespace-nowrap">
                  ${Number(item.subtotal).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="p-6 border-t border-white/10 flex justify-between items-center bg-gradient-to-r from-[#E0C89A]/10 to-transparent">
          <span className="text-white/70 uppercase text-xs tracking-wider">
            Total
          </span>
          <span className="font-serif text-3xl text-white">
            ${Number(order.total).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Cambio de estado */}
      <div className="print:hidden">
        <OrderStatusPanel order={order} />
      </div>

      {/* Referencia de pago */}
      {order.payment_reference && (
        <div className={`${glass} rounded-2xl p-6`}>
          <h2 className="font-serif text-lg text-white mb-2">Referencia de pago</h2>
          <p className="text-sm text-white/75 font-mono bg-white/5 px-4 py-2 rounded-lg inline-block">
            {order.payment_reference}
          </p>
        </div>
      )}
    </div>
  )
}