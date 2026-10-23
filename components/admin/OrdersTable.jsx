// components/admin/OrdersTable.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, User, Phone, Calendar, LayoutGrid, List } from 'lucide-react'

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  payment_review: 'Revisar pago',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const TABS = [
  { value: 'all', label: 'Todos', statuses: null },
  { value: 'new', label: 'Nuevos', statuses: ['pending_payment', 'payment_review'] },
  { value: 'preparing', label: 'En preparación', statuses: ['confirmed', 'preparing'] },
  { value: 'ready', label: 'Listos', statuses: ['ready'] },
  { value: 'history', label: 'Historial', statuses: ['delivered', 'cancelled'] },
]

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function formatDate(dateString) {
  const d = new Date(dateString)
  const day = d.getDate().toString().padStart(2, '0')
  const month = MONTHS[d.getMonth()]
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}-${month}, ${hours}:${minutes}`
}

// Función para renderizar los badges con los estilos vibrantes
function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status

  if (status === 'pending_payment' || status === 'payment_review') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'confirmed' || status === 'preparing') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'ready') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'delivered') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-white/10 text-white/60 border border-white/10">
        {label}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-red-500/10 text-red-400 border border-red-500/30">
      {label}
    </span>
  )
}

// Función para darle color al contorno y fondo de la tarjeta según el estado
function getCardStyles(status) {
  switch (status) {
    case 'pending_payment':
    case 'payment_review':
      return 'border-amber-500/40 bg-gradient-to-br from-[#2A1810]/90 to-amber-900/20 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
    case 'confirmed':
    case 'preparing':
      return 'border-emerald-500/40 bg-gradient-to-br from-[#2A1810]/90 to-emerald-900/20 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    case 'ready':
      return 'border-cyan-500/40 bg-gradient-to-br from-[#2A1810]/90 to-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
    case 'delivered':
      return 'border-white/10 bg-[#2A1810]/80 hover:border-white/30'
    case 'cancelled':
      return 'border-red-500/30 bg-gradient-to-br from-[#2A1810]/90 to-red-900/20 hover:border-red-400'
    default:
      return 'border-[#C9A96E]/20 bg-[#2A1810]/90 hover:border-[#C9A96E]/50'
  }
}

export default function OrdersTable({ orders }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')

  // Cargar preferencia de vista
  useEffect(() => {
    const savedView = localStorage.getItem('admin-orders-view')
    if (savedView) setView(savedView)
  }, [])

  const changeView = (newView) => {
    setView(newView)
    localStorage.setItem('admin-orders-view', newView)
  }

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
      {/* Buscador y Toggle de Vista */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A96E]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pedido..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#C9A96E]/30 bg-[#1a0806] text-[#F5EDE3] placeholder:text-white/30 focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition shadow-inner text-sm"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center bg-[#1a0806] rounded-xl border border-white/10 p-1">
            <button
              onClick={() => changeView('grid')}
              className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`}
              title="Vista de tarjetas"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => changeView('list')}
              className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`}
              title="Vista de lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (Desktop) y Dropdown (Mobile) */}
      <div className="md:hidden">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#1a0806] text-white focus:border-[#C9A96E] focus:outline-none appearance-none"
        >
          {TABS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label} ({t.statuses ? orders.filter((o) => t.statuses.includes(o.status)).length : orders.length})
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:flex flex-wrap gap-2">
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
                  ? 'bg-[#C9A96E] text-[#2b0f0b] border-[#C9A96E] font-bold shadow-md transform scale-[1.02]'
                  : 'bg-[#23120B] text-white/60 border-white/10 hover:bg-[#341D14] hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? 'bg-black/20 text-black' : 'bg-white/10'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {filtered.length === 0 ? (
        <div className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-2xl p-12 text-center shadow-lg shadow-black/40">
          <p className="text-[#F5EDE3]/70">
            {query ? 'No hay pedidos que coincidan con la búsqueda.' : 'No hay pedidos en esta categoría.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        // --- VISTA GRID (TARJETAS) ---
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((order, index) => (
            <div
              key={order.id || `order-${index}`}
              className={`relative flex flex-col rounded-2xl p-5 transition-all duration-300 shadow-lg shadow-black/40 border ${getCardStyles(order.status)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-base text-[#F5EDE3] font-bold mb-1">{order.order_number}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#C9A96E]/80">
                    <Calendar size={12} className="text-[#C9A96E]" />
                    <span suppressHydrationWarning>{formatDate(order.created_at)}</span>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-[#F5EDE3] font-bold text-lg">
                  <User size={16} className="text-[#C9A96E]/70" />
                  {order.customer_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C9A96E]/70">
                  <Phone size={14} className="text-[#C9A96E]/70" />
                  {order.customer_phone}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-[#C9A96E]/60 mb-0.5 font-semibold tracking-wider">Total</p>
                  <p className="font-serif text-2xl text-[#F5EDE3] font-bold">${Number(order.total).toLocaleString('es-AR')}</p>
                </div>
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-2 bg-[#341D14] text-[#F5EDE3] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#C9A96E] hover:text-[#2b0f0b] transition-colors border border-[#C9A96E]/20"
                >
                  Ver <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // --- VISTA LISTA (TABLA) ---
        <div className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-[#1a0806] text-[#C9A96E]/70 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">Nro.</th>
                  <th className="text-left px-6 py-4 font-medium">Cliente</th>
                  <th className="text-left px-6 py-4 font-medium">Fecha</th>
                  <th className="text-left px-6 py-4 font-medium">Total</th>
                  <th className="text-left px-6 py-4 font-medium">Estado</th>
                  <th className="text-right px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, index) => (
                  <tr key={order.id || `order-list-${index}`} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-mono text-[#F5EDE3] font-bold">{order.order_number}</td>
                    <td className="px-6 py-4 text-[#F5EDE3]">{order.customer_name}</td>
                    <td className="px-6 py-4 text-[#C9A96E]/70 text-xs" suppressHydrationWarning>{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 font-bold text-[#F5EDE3]">${Number(order.total).toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/pedidos/${order.id}`} className="inline-flex items-center gap-1 text-[#C9A96E] hover:text-white transition">
                        Ver <ArrowRight size={14} />
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