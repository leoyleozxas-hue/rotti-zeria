// components/OrderStatusLookup.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Truck,
  User,
  XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS } from '@/lib/constants/orders'
import { SITE_CONFIG } from '@/lib/config'

const money = (v) => `$${Number(v).toLocaleString('es-AR')}`

// Timeline pública: 5 pasos visibles. Los primeros dos estados internos
// (pending_payment / payment_review) colapsan en "Recibido".
const STEPS = [
  { key: 'received', label: 'Recibido', matches: ['pending_payment', 'payment_review'] },
  { key: 'confirmed', label: 'Confirmado', matches: ['confirmed'] },
  { key: 'preparing', label: 'Preparando', matches: ['preparing'] },
  { key: 'ready', label: 'Listo', matches: ['ready'] },
  { key: 'delivered', label: 'Entregado', matches: ['delivered'] },
]

function currentStepIndex(status) {
  if (status === 'cancelled') return -1
  return STEPS.findIndex((s) => s.matches.includes(status))
}

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPickupDate(iso) {
  if (!iso) return null
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

export default function OrderStatusLookup() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('idle') // idle | loading | found | not_found | error
  const [order, setOrder] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!orderNumber.trim() || !phone.trim()) return

    setState('loading')
    setErrorMessage('')
    setOrder(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_order_status', {
        p_order_number: orderNumber.trim(),
        p_phone: phone.trim(),
      })

      if (error) {
        setErrorMessage(error.message || 'Error consultando el pedido')
        setState('error')
        return
      }

      if (!data) {
        setState('not_found')
        return
      }

      setOrder(data)
      setState('found')
    } catch (err) {
      setErrorMessage(err.message || 'Error inesperado')
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setOrder(null)
    setErrorMessage('')
  }

  // ─── Estado found: ficha completa ───
  if (state === 'found' && order) {
    const meta = ORDER_STATUS[order.status] || { label: order.status }
    const stepIdx = currentStepIndex(order.status)
    const isCancelled = order.status === 'cancelled'
    const isPending = ['pending_payment', 'payment_review'].includes(order.status)
    const whatsapp = (SITE_CONFIG.whatsapp || '').replace(/\D/g, '')

    return (
      <div className="anim-rise space-y-5">
        {/* Header con estado grande */}
        <div className="rounded-2xl border border-sand/50 bg-paper p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-eyebrow uppercase tracking-[0.14em] text-stone">Pedido</p>
              <p className="mt-1 font-mono text-lg font-semibold text-chocolate break-all">
                {order.order_number}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isCancelled
                  ? 'border-ember/30 bg-ember/10 text-ember'
                  : isPending
                  ? 'border-gold/40 bg-gold/15 text-chocolate'
                  : 'border-active/40 bg-active/10 text-chocolate'
              }`}
            >
              {isCancelled ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
              {meta.label}
            </span>
          </div>

          {/* Timeline (excepto cancelado) */}
          {!isCancelled ? (
            <ol className="mt-7 grid grid-cols-5 gap-1.5" aria-label="Progreso del pedido">
              {STEPS.map((step, i) => {
                const done = i < stepIdx
                const current = i === stepIdx
                return (
                  <li key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold transition ${
                        done
                          ? 'border-chocolate bg-chocolate text-cream'
                          : current
                          ? 'border-gold bg-gold text-chocolate'
                          : 'border-sand/60 bg-paper text-stone'
                      }`}
                    >
                      {done ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span
                      className={`mt-2 text-[10px] leading-tight sm:text-[11px] ${
                        current ? 'font-semibold text-chocolate' : 'text-stone'
                      }`}
                    >
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="mt-6 rounded-field border border-ember/25 bg-ember/5 p-4 text-sm text-ember">
              Este pedido fue cancelado. Si tenés dudas, escribinos por WhatsApp.
            </div>
          )}

          {isPending && (
            <p className="mt-5 rounded-field border border-gold/30 bg-gold/5 p-3 text-caption text-caramel">
              <strong className="text-chocolate">Paso pendiente:</strong> transferí el total
              y envianos el comprobante por WhatsApp para que lo confirmemos.
            </p>
          )}
        </div>

        {/* Detalle del pedido */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sand/50 bg-paper p-5">
            <h2 className="mb-3 flex items-center gap-2 border-b border-sand/40 pb-2 font-serif text-base text-chocolate">
              <User size={15} aria-hidden className="text-gold" />
              Cliente
            </h2>
            <p className="font-medium text-chocolate">{order.customer_name}</p>
            <p className="mt-1 text-caption text-caramel">Creado el {formatDate(order.created_at)}</p>
          </div>

          <div className="rounded-2xl border border-sand/50 bg-paper p-5">
            <h2 className="mb-3 flex items-center gap-2 border-b border-sand/40 pb-2 font-serif text-base text-chocolate">
              {order.delivery_type === 'pickup' ? (
                <PackageCheck size={15} aria-hidden className="text-gold" />
              ) : (
                <Truck size={15} aria-hidden className="text-gold" />
              )}
              {order.delivery_type === 'pickup' ? 'Retiro' : 'Envío'}
            </h2>
            {order.address && (
              <p className="flex items-start gap-2 text-caption text-caramel">
                <MapPin size={13} aria-hidden className="mt-0.5 shrink-0" />
                {order.address}
              </p>
            )}
            {order.pickup_date && (
              <p className="mt-1.5 flex items-center gap-2 capitalize text-caption text-caramel">
                <Calendar size={13} aria-hidden className="shrink-0" />
                {formatPickupDate(order.pickup_date)}
                {order.pickup_time && <span className="text-stone">· {order.pickup_time} hs</span>}
              </p>
            )}
          </div>
        </div>

        {/* Ítems */}
        {order.items?.length > 0 && (
          <div className="rounded-2xl border border-sand/50 bg-paper p-5">
            <h2 className="mb-3 font-serif text-base text-chocolate">Productos</h2>
            <ul className="divide-y divide-sand/40">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-chocolate">
                    <span className="mr-2 font-semibold text-gold">{it.quantity}×</span>
                    {it.product_name}
                  </span>
                  <span className="tabular shrink-0 font-medium text-chocolate">
                    {money(it.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-gold/25 pt-3">
              <span className="text-eyebrow uppercase tracking-[0.14em] font-semibold text-chocolate">
                Total
              </span>
              <span className="tabular font-serif text-xl font-semibold text-chocolate">
                {money(order.total)}
              </span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                `Hola! Consulto por mi pedido ${order.order_number}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1eb356]"
            >
              <MessageCircle size={16} /> Consultar por WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-full border border-sand/60 bg-paper px-6 py-3 text-sm font-medium text-chocolate transition hover:bg-beige"
          >
            <Search size={15} /> Buscar otro pedido
          </button>
        </div>
      </div>
    )
  }

  // ─── Form (idle / loading / error / not_found) ───
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-sand/50 bg-paper p-6 shadow-card sm:p-8"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="order-number"
            className="mb-1.5 block text-caption font-semibold uppercase tracking-[0.14em] text-chocolate"
          >
            Número de pedido
          </label>
          <input
            id="order-number"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="BZ-251113-0001"
            required
            autoComplete="off"
            className="h-11 w-full rounded-field border border-sand/60 bg-cream px-4 text-body text-chocolate placeholder:text-stone/60 transition focus:border-chocolate focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="order-phone"
            className="mb-1.5 block text-caption font-semibold uppercase tracking-[0.14em] text-chocolate"
          >
            Teléfono
          </label>
          <input
            id="order-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 5555-1234"
            required
            autoComplete="tel"
            className="h-11 w-full rounded-field border border-sand/60 bg-cream px-4 text-body text-chocolate placeholder:text-stone/60 transition focus:border-chocolate focus:outline-none"
          />
          <p className="mt-1.5 text-[11px] text-stone">
            El mismo que usaste al hacer el pedido.
          </p>
        </div>

        {state === 'not_found' && (
          <p className="rounded-field border border-ember/25 bg-ember/5 p-3 text-caption text-ember">
            No encontramos un pedido con esos datos. Revisá el número y el teléfono.
          </p>
        )}
        {state === 'error' && (
          <p className="rounded-field border border-ember/25 bg-ember/5 p-3 text-caption text-ember">
            {errorMessage || 'No pudimos consultar el pedido. Intentá de nuevo.'}
          </p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-chocolate px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-ember disabled:opacity-50"
        >
          {state === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Buscando…
            </>
          ) : (
            <>
              <Search size={16} /> Consultar estado
            </>
          )}
        </button>
      </div>
    </form>
  )
}