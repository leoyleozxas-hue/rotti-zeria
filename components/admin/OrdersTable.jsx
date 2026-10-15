// components/admin/OrdersTable.jsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

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

const glass =
  'relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]'

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
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por número, nombre o teléfono..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-white/20 bg-white/8 backdrop-blur-xl text-white placeholder:text-white/40 focus:border-[#E0C89A]/50 focus:outline-none transition shadow-[inset_0_1px_0_rgba(255,255,255,.1)]"
        />
      </div>

      {/* Tabs */}
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
                className={`text-xs px-1.5 rounded-full ${
                  active ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className={`${glass} rounded-2xl p-12 text-center`}>
          <p className="text-white/60">
            {query
              ? 'No hay pedidos que coincidan con la búsqueda.'
              : 'No hay pedidos en esta categoría.'}
          </p>
        </div>
      ) : (
        <div className={`${glass} rounded-2xl overflow-hidden`}>
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#150604]/98 backdrop-blur-xl">
                <tr className="text-white/50">
                  <th className="text-left px-6 py-4 font-normal text-xs uppercase tracking-wider">
                    Nro.
                  </th>
                  <th className="text-left px-6 py-4 font-normal text-xs uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-4 font-normal text-xs uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-4 font-normal text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-6 py-4 font-normal text-xs uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, index) => (
                  <tr
                    key={order.id || `order-${index}`}
                    className="border-t border-white/8 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#E0C89A]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-white/55 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          STATUS_COLORS[order.status] ||
                          'bg-white/15 text-white/80 border-white/25'
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-[#E0C89A] hover:text-white text-sm transition"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}