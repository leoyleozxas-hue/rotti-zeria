// app/admin/pedidos/[id]/page.jsx
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Mail, MapPin, MessageCircle, Phone, Truck, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/config'
import OrderStatusPanel from '@/components/admin/OrderStatusPanel'
import PrintButton from '@/components/admin/PrintButton'
import Panel, { PanelHeader } from '@/components/ui/panel'
import StatusBadge from '@/components/ui/status-badge'
import PageHeader from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'

async function getOrder(id) {
  const supabase = await createClient()
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single()
  if (error || !order) return null

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (itemsError) return { order, items: [] }

  let productMap = {}
  const productIds = (items || []).map((i) => i.product_id).filter(Boolean)
  if (productIds.length) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', productIds)
    if (products) productMap = Object.fromEntries(products.map((p) => [p.id, p]))
  }

  const enriched = (items || []).map((item) => {
    const fallback = item.product_id ? productMap[item.product_id] : null
    const name = item.product_name
    const usableName =
      name && name !== 'Producto sin nombre' && name !== 'Producto eliminado'
        ? name
        : fallback?.name

    return {
      ...item,
      display_name: usableName || 'Producto eliminado',
      display_image: item.product_image || fallback?.image_url || null,
    }
  })

  return { order, items: enriched }
}

const money = (value) => `$${Number(value).toLocaleString('es-AR')}`

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
    ? new Date(`${order.pickup_date}T00:00:00`).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
    : null

  const cleanPhone = order.customer_phone?.replace(/\D/g, '')
  const whatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hola ${order.customer_name}, te escribimos de ${SITE_CONFIG.businessName} por tu pedido ${order.order_number}.`
      )}`
    : null

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <PageHeader
        eyebrow="Pedido"
        title={order.order_number}
        description={`Creado el ${createdAt}`}
        backHref="/admin/pedidos"
        backLabel="Volver a pedidos"
        actions={<PrintButton />}
      />

      <Panel tone="glass" padded={false}>
        <PanelHeader
          title="Productos a preparar"
          action={<StatusBadge status={order.status} size="md" />}
        />

        <ul className="divide-y divide-white/8">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              {item.display_image ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-field border border-white/10 bg-ink-950">
                  <Image src={item.display_image} alt="" fill sizes="56px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-field border border-white/10 bg-white/5 text-[10px] text-white/25">
                  Sin foto
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{item.display_name}</p>
                <p className="tabular mt-0.5 text-xs text-white/45">{money(item.unit_price)} c/u</p>
              </div>

              <div className="shrink-0 text-right">
                <span className="tabular mr-3 text-sm font-semibold text-gold-soft">{item.quantity}×</span>
                <span className="tabular font-semibold text-white">{money(item.subtotal)}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-gold/25 bg-gradient-to-r from-gold/10 to-transparent px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Total</span>
          <span className="tabular font-serif text-2xl font-semibold text-white">{money(order.total)}</span>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel tone="glass">
          <h2 className="mb-3 flex items-center gap-2 border-b border-white/8 pb-3 font-serif text-base text-white">
            <User size={15} aria-hidden className="text-gold-soft" />
            Cliente
          </h2>

          <p className="font-semibold text-white">{order.customer_name}</p>

          <a
            href={`tel:${cleanPhone}`}
            className="mt-2 flex items-center gap-2 text-sm text-white/60 transition hover:text-gold-soft"
          >
            <Phone size={13} aria-hidden className="shrink-0" />
            {order.customer_phone}
          </a>

          {order.customer_email && (
            <a
              href={`mailto:${order.customer_email}`}
              className="mt-1.5 flex items-center gap-2 text-sm text-white/60 transition hover:text-gold-soft"
            >
              <Mail size={13} aria-hidden className="shrink-0" />
              {order.customer_email}
            </a>
          )}

          {whatsappLink && (
            <ButtonLink
              href={whatsappLink}
              variant="success"
              size="sm"
              className="mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} aria-hidden />
              Escribir por WhatsApp
            </ButtonLink>
          )}
        </Panel>

        <Panel tone="glass">
          <h2 className="mb-3 flex items-center gap-2 border-b border-white/8 pb-3 font-serif text-base text-white">
            <Truck size={15} aria-hidden className="text-gold-soft" />
            Entrega
          </h2>

          <p className="font-medium text-white">
            {order.delivery_type === 'pickup' ? 'Retiro en el local' : 'Envío a domicilio'}
          </p>

          {order.address && (
            <p className="mt-2 flex items-start gap-2 text-sm text-white/60">
              <MapPin size={13} aria-hidden className="mt-0.5 shrink-0" />
              {order.address}
            </p>
          )}

          {pickupDate && (
            <p className="mt-1.5 flex items-center gap-2 text-sm capitalize text-white/60">
              <Calendar size={13} aria-hidden className="shrink-0" />
              {pickupDate}
              {order.pickup_time && <span className="text-white/40">· {order.pickup_time} hs</span>}
            </p>
          )}

          <p className="mt-1.5 flex items-center gap-2 text-sm text-white/40">
            <Clock size={13} aria-hidden className="shrink-0" />
            Ingresado el {createdAt}
          </p>
        </Panel>
      </div>

      {order.payment_reference && (
        <Panel tone="glass">
          <h2 className="mb-2 font-serif text-base text-white">Referencia de pago</h2>
          <p className="inline-block rounded-field border border-white/10 bg-ink-950/60 px-4 py-2 font-mono text-sm text-white/75">
            {order.payment_reference}
          </p>
        </Panel>
      )}

      <div className="print:hidden">
        <OrderStatusPanel order={order} />
      </div>
    </div>
  )
}