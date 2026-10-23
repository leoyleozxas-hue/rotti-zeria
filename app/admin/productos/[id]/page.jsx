// app/admin/pedidos/[id]/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Truck, User, Clock, MessageCircle } from 'lucide-react'
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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError || !order) return null

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (itemsError) return { order, items: [] }

  let productMap = {}
  if (items && items.length > 0) {
    const productIds = items.map(i => i.product_id).filter(Boolean)
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds)
      if (products) productMap = Object.fromEntries(products.map(p => [p.id, p]))
    }
  }

  const enrichedItems = (items || []).map((item) => {
    const fallbackProduct = item.product_id ? productMap[item.product_id] : null
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
    ? new Date(order.pickup_date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })
    : null

  // Limpiamos el teléfono para el link de WhatsApp
  const cleanPhone = order.customer_phone?.replace(/\D/g, '')
  const whatsappLink = `https://wa.me/${cleanPhone}?text=Hola%20${order.customer_name},%20te%20escribimos%20de%20Biarritz%20por%20tu%20pedido%20${order.order_number}`

  return (
    <div className="space-y-5 text-[#F5EDE3] max-w-4xl mx-auto w-full">
      {/* Botones superiores */}
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition text-sm">
          <ArrowLeft size={16} /> Volver
        </Link>
        <PrintButton />
      </div>

      {/* 1. CABECERA Y METADATOS */}
      <div className={`${glass} rounded-2xl p-5 md:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E0C89A] mb-1">Pedido</p>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-mono tracking-tight">
              {order.order_number}
            </h1>
            <p className="text-white/50 text-sm mt-2 flex items-center gap-2">
              <Clock size={13} /> {createdAt}
            </p>
          </div>
          <span className={`text-xs px-4 py-1.5 rounded-full font-bold border self-start ${STATUS_COLORS[order.status] || 'bg-white/15 text-white/80'}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* 2. BLOQUE PRINCIPAL - PRODUCTOS */}
      <div className={`${glass} rounded-2xl overflow-hidden`}>
        <div className="p-5 border-b border-white/10 bg-white/5">
          <h2 className="font-serif text-xl text-white">Productos a preparar</h2>
        </div>
        <div className="divide-y divide-white/10">
          {items.map((item, index) => (
            <div key={item.id || `item-${index}`} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                {item.display_image ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/8 border border-white/10 shrink-0">
                    <Image src={item.display_image} alt={item.display_name} fill className="object-cover" sizes="64px" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/20 text-xs">Sin foto</div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#C9A96E] leading-none">{item.quantity}x</span>
                    <p className="text-white font-medium text-lg leading-tight truncate">{item.display_name}</p>
                  </div>
                  <p className="text-sm text-white/50 mt-1">${Number(item.unit_price).toLocaleString('es-AR')} c/u</p>
                </div>
              </div>
              
              <div className="text-left md:text-right md:w-32 shrink-0">
                <p className="text-sm text-white/50 mb-0.5 md:hidden">Subtotal</p>
                <span className="font-bold text-xl text-white">${Number(item.subtotal).toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* TOTAL DESTACADO */}
        <div className="p-5 md:p-6 border-t border-[#C9A96E]/30 bg-gradient-to-r from-[#E0C89A]/15 to-transparent flex justify-between items-center">
          <span className="text-[#C9A96E] uppercase text-sm tracking-wider font-bold">Total</span>
          <span className="font-serif text-3xl md:text-4xl text-white font-bold">${Number(order.total).toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* 3. BLOQUE SECUNDARIO - CLIENTE Y ENVÍO */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className={`${glass} rounded-2xl p-5 space-y-3`}>
          <h2 className="font-serif text-lg text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
            <User size={16} className="text-[#E0C89A]" /> Cliente
          </h2>
          <p className="text-white font-bold text-lg">{order.customer_name}</p>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Phone size={14} className="text-[#E0C89A] shrink-0" />
            <a href={`tel:${cleanPhone}`} className="hover:text-[#E0C89A] transition">{order.customer_phone}</a>
          </div>
          {order.customer_email && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Mail size={14} className="text-[#E0C89A] shrink-0" />
              {order.customer_email}
            </div>
          )}
          {/* Botón de WhatsApp */}
          <div className="pt-2">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition"
            >
              <MessageCircle size={16} /> Contactar por WhatsApp
            </a>
          </div>
        </div>

        <div className={`${glass} rounded-2xl p-5 space-y-3`}>
          <h2 className="font-serif text-lg text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
            <Truck size={16} className="text-[#E0C89A]" /> Entrega
          </h2>
          <p className="text-white font-medium text-lg">
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
              {order.pickup_time && <span>· {order.pickup_time} hs</span>}
            </div>
          )}
        </div>
      </div>

      {/* 4. BLOQUE INFERIOR Y ACCIONES */}
      <div className="print:hidden space-y-4">
        <OrderStatusPanel order={order} />
      </div>

      {order.payment_reference && (
        <div className={`${glass} rounded-2xl p-5`}>
          <h2 className="font-serif text-lg text-white mb-2">Referencia de pago</h2>
          <p className="text-sm text-white/75 font-mono bg-white/5 px-4 py-2 rounded-lg inline-block border border-white/10">
            {order.payment_reference}
          </p>
        </div>
      )}
    </div>
  )
}