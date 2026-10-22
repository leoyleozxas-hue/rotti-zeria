// components/admin/OrdersTable.jsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, User, Phone, Calendar } from 'lucide-react'

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

const TABS = [
  { value: 'all', label: 'Todos', statuses: null },
  { value: 'new', label: 'Nuevos', statuses: ['pending_payment', 'payment_review'] },
  { value: 'preparing', label: 'En preparación', statuses: ['confirmed', 'preparing'] },
  { value: 'ready', label: 'Listos', statuses: ['ready'] },
  { value: 'history', label: 'Historial', statuses: ['delivered', 'cancelled'] },
]

// Función para formatear fechas a mano y evitar Hydration Mismatch
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function formatDate(dateString) {
  const d = new Date(dateString)
  const day = d.getDate().toString().padStart(2, '0')
  const month = MONTHS[d.getMonth()]
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}-${month}, ${hours}:${minutes}`
}

export default function OrdersTable({ orders }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const tabConfig = TABS.find((t) => t.value === tab)
    let list = orders

    if (tabConfig?.statuses) {
      list = list.filter((o) => tabConfig.statuses.includes(o.status))
    }

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.toLowerCase().includes(q)
      )
    }

    return list
  }, [orders, tab, query])

  return (
    <div className="space-y-6">
      {/* Buscador y Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por número, nombre o teléfono..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/20 bg-[#150604]/50 backdrop-blur-xl text-white placeholder:text-white/40 focus:border-[#E0C89A]/50 focus:outline-none transition shadow-inner"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count = t.statuses
              ? orders.filter((o) => t.statuses.includes(o.status)).length
              : orders.length
            const active = tab === t.value
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 text-sm rounded-full border transition flex items-center gap-2 ${
                  active
                    ? 'bg-gradient-to-r from-[#E0C89A]/30 to-[#E0C89A]/10 text-white border-[#E0C89A]/50 shadow-[inset_0_1px_0_rgba(255,255,255,.2)]'
                    : 'bg-white/5 text-white/65 border-white/15 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.label}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    active ? 'bg-[#E0C89A] text-[#2b0f0b]' : 'bg-white/10'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grilla de Tarjetas */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/60">
            {query
              ? 'No hay pedidos que coincidan con la búsqueda.'
              : 'No hay pedidos en esta categoría.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((order, index) => (
            <div
              key={order.id || `order-${index}`}
              className="relative flex flex-col bg-[#1a0806]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-[#E0C89A]/40 hover:bg-[#1a0806]/80 transition-all duration-300 shadow-lg group"
            >
              {/* Cabecera Tarjeta */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-sm text-[#E0C89A] mb-1">
                    {order.order_number}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Calendar size={12} />
                    <span suppressHydrationWarning>
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold border ${
                    STATUS_COLORS[order.status] || 'bg-white/15 text-white/80 border-white/25'
                  }`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Datos Cliente */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-white font-medium">
                  <User size={16} className="text-white/40" />
                  {order.customer_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Phone size={14} className="text-white/40" />
                  {order.customer_phone}
                </div>
              </div>

              {/* Footer Tarjeta */}
              <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-white/40 mb-0.5">Total</p>
                  <p className="font-serif text-xl text-white font-bold">
                    ${Number(order.total).toLocaleString('es-AR')}
                  </p>
                </div>
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-2 bg-white/10 text-white/80 px-4 py-2 rounded-xl text-sm font-medium group-hover:bg-[#E0C89A] group-hover:text-[#2b0f0b] transition-colors"
                >
                  Ver <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}