// app/admin/pedidos/[id]/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Truck } from 'lucide-react'
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
  pending_payment: 'bg-amber-400/20 text-amber-100 border-amber-300/30',
  payment_review: 'bg-orange-400/20 text-orange-100 border-orange-300/30',
  confirmed: 'bg-sky-400/20 text-sky-100 border-sky-300/30',
  preparing: 'bg-violet-400/20 text-violet-100 border-violet-300/30',
  ready: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30',
  delivered: 'bg-white/15 text-white/80 border-white/20',
  cancelled: 'bg-red-400/20 text-red-100 border-red-300/30',
}

const glass = 'relative border border-white/10 bg-[#1a0806]/60 backdrop-blur-xl shadow-xl'

async function getOrder(id) {
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  return { order, items: items || [] }
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params
  const data = await getOrder(id)

  if (!data) notFound()

  const { order, items } = data

  const createdAt = new Date(order.created_at).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const pickupDate = order.pickup_date
    ? new Date(order.pickup_date + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
    : null

  return (
    <div className="space-y-6 text-[#F5EDE3] max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} /> Volver a pedidos
        </Link>
        <PrintButton />
      </div>

      {/* Cabecera */}
      <div className={`${glass} p-6`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#E0C89A] mb-1">
              Pedido
            </p>
            <h1 className="font-serif text-3xl text-white font-mono">
              {order.order_number}
            </h1>
            <p className="text-white/55 text-sm mt-2">Creado el {createdAt}</p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
              STATUS_COLORS[order.status] || 'bg-white/15 text-white/80 border-white/20'
            }`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Grid: cliente + entrega */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div className={`${glass} p-6 space-y-3`}>
          <h2 className="font-serif text-lg text-white mb-3">Cliente</h2>
          <p className="text-white font-medium">{order.customer_name}</p>

          <div className="flex items-center gap-2 text-sm text-white/75">
            <Phone size={14} className="text-[#E0C89A]" />
            {order.customer_phone}
          </div>

          {order.customer_email && (
            <div className="flex items-center gap-2 text-sm text-white/75">
              <Mail size={14} className="text-[#E0C89A]" />
              {order.customer_email}
            </div>
          )}
        </div>

        {/* Entrega */}
        <div className={`${glass} p-6 space-y-3`}>
          <h2 className="font-serif text-lg text-white mb-3">Entrega</h2>

          <div className="flex items-center gap-2 text-sm text-white/75">
            <Truck size={14} className="text-[#E0C89A]" />
            {order.delivery_type === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}
          </div>

          {order.address && (
            <div className="flex items-start gap-2 text-sm text-white/75">
              <MapPin size={14} className="text-[#E0C89A] mt-1 shrink-0" />
              <span>{order.address}</span>
            </div>
          )}

          {pickupDate && (
            <div className="flex items-center gap-2 text-sm text-white/75">
              <Calendar size={14} className="text-[#E0C89A]" />
              <span className="capitalize">{pickupDate}</span>
              {order.pickup_time && <span>· {order.pickup_time}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className={`${glass} overflow-hidden`}>
        <div className="p-6 border-b border-white/15">
          <h2 className="font-serif text-lg text-white">Productos</h2>
        </div>
        <div className="divide-y divide-white/10">
          {items.map((item) => (
            <div key={item.id} className="p-5 flex items-center gap-4">
              {item.product_image && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0">
                  <Image
                    src={item.product_image}
                    alt={item.product_name || 'Producto'}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">
                  {item.product_name || 'Producto sin nombre'}
                </p>
                <p className="text-sm text-white/60">
                  {item.quantity} × ${Number(item.unit_price).toLocaleString('es-AR')}
                </p>
              </div>
              <span className="text-white font-semibold">
                ${Number(item.subtotal).toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-white/15 flex justify-between items-center bg-white/5">
          <span className="text-white/70">Total</span>
          <span className="font-serif text-2xl text-white">
            ${Number(order.total).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Panel de cambio de estado */}
      <OrderStatusPanel order={order} />

      {/* Notas de pago */}
      {order.payment_reference && (
        <div className={`${glass} p-6`}>
          <h2 className="font-serif text-lg text-white mb-2">
            Referencia de pago
          </h2>
          <p className="text-sm text-white/75 font-mono">{order.payment_reference}</p>
        </div>
      )}
    </div>
  )
}