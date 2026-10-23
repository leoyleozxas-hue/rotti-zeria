// components/admin/OrdersBoard.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Eye, ChefHat, CheckCircle, PackageCheck, X, 
  ChevronDown, ChevronUp, User, Phone, AlertTriangle,
  Search, LayoutGrid, List, Calendar, ArrowRight
} from 'lucide-react'

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

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status
  if (status === 'pending_payment' || status === 'payment_review') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'confirmed' || status === 'preparing') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'ready') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'delivered') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-white/10 text-white/60 border border-white/10">
        {label}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-red-500/10 text-red-400 border border-red-500/30">
      {label}
    </span>
  )
}

function getCardBorder(status) {
  switch (status) {
    case 'pending_payment':
    case 'payment_review':
      return 'border-amber-500/40 hover:border-amber-400'
    case 'confirmed':
    case 'preparing':
      return 'border-emerald-500/40 hover:border-emerald-400'
    case 'ready':
      return 'border-cyan-500/40 hover:border-cyan-400'
    case 'delivered':
      return 'border-white/10 hover:border-white/30'
    case 'cancelled':
      return 'border-red-500/30 hover:border-red-400'
    default:
      return 'border-[#C9A96E]/20 hover:border-[#C9A96E]/50'
  }
}

export default function OrdersBoard({ initialOrders }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(initialOrders)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [cancelModal, setCancelModal] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)

  // Sincronizar tab con URL
  const estadoUrl = searchParams.get('estado') || 'all'
  const [tab, setTab] = useState(estadoUrl)

  useEffect(() => {
    const valid = TABS.some(t => t.value === estadoUrl)
    setTab(valid ? estadoUrl : 'all')
  }, [estadoUrl])

  // Al cambiar de pestaña, actualizamos la URL
  const handleTabChange = (newTab) => {
    setTab(newTab)
    const url = newTab === 'all' ? '/admin/pedidos' : `/admin/pedidos?estado=${newTab}`
    router.push(url, { scroll: false })
  }

  useEffect(() => {
    const savedView = localStorage.getItem('admin-orders-view')
    if (savedView) setView(savedView)
  }, [])

  const changeView = (newView) => {
    setView(newView)
    localStorage.setItem('admin-orders-view', newView)
  }

  const updateStatus = async (orderId, newStatus) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (error) {
      toast.error('Error al actualizar: ' + error.message)
      router.refresh()
    } else {
      toast.success('Pedido actualizado')
    }
  }

  const handleCancel = async () => {
    if (!cancelModal) return
    await updateStatus(cancelModal, 'cancelled')
    setCancelModal(null)
  }

  const filtered = useMemo(() => {
    const tabConfig = TABS.find(t => t.value === tab)
    let list = orders
    if (tabConfig?.statuses) list = list.filter(o => tabConfig.statuses.includes(o.status))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(o => 
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, tab, query])

  const renderActions = (order) => {
    if (['pending_payment', 'payment_review'].includes(order.status)) {
      return (
        <div className="flex gap-2">
          <Link href={`/admin/pedidos/${order.id}`} className="flex-1 flex items-center justify-center gap-1 bg-white/5 text-white/80 py-2 rounded-lg text-xs font-medium hover:bg-white/10 transition border border-white/10">
            <Eye size={13} /> Ver
          </Link>
          <button onClick={() => updateStatus(order.id, 'confirmed')} className="flex-1 flex items-center justify-center gap-1 bg-[#E0C89A] text-[#2b0f0b] py-2 rounded-lg text-xs font-bold hover:bg-white transition shadow-md">
            <ChefHat size={13} /> Preparar
          </button>
        </div>
      )
    }
    if (['confirmed', 'preparing'].includes(order.status)) {
      return (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setExpandedCard(expandedCard === order.id ? null : order.id)}
            className="w-full flex items-center justify-between text-xs text-[#C9A96E] hover:text-white transition bg-[#341D14] px-3 py-2 rounded-lg"
          >
            <span>Ver productos ({order.order_items?.length || 0})</span>
            {expandedCard === order.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {expandedCard === order.id && (
            <div className="bg-black/30 rounded-lg p-3 text-xs space-y-1.5 border border-white/5">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between text-white/80">
                  <span><span className="text-[#C9A96E] font-bold mr-1">{item.quantity}x</span> {item.product_name}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => updateStatus(order.id, 'ready')} className="w-full flex items-center justify-center gap-1 bg-emerald-500/20 text-emerald-200 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-black transition border border-emerald-500/30">
            <CheckCircle size={13} /> Marcar como listo
          </button>
        </div>
      )
    }
    if (order.status === 'ready') {
      return (
        <button onClick={() => updateStatus(order.id, 'delivered')} className="w-full flex items-center justify-center gap-1 bg-cyan-500/20 text-cyan-200 py-2 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-black transition border border-cyan-500/30">
          <PackageCheck size={13} /> Entregar pedido
        </button>
      )
    }
    return (
      <Link href={`/admin/pedidos/${order.id}`} className="w-full flex items-center justify-center gap-1 bg-white/5 text-white/50 py-2 rounded-lg text-xs font-medium hover:bg-white/10 transition">
        <Eye size={13} /> Ver detalle
      </Link>
    )
  }

  return (
    <div className="space-y-5 w-full">
      {/* Buscador y toggle de vista */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A96E]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por número, nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9A96E]/30 bg-[#1a0806] text-[#F5EDE3] placeholder:text-white/30 focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition shadow-inner text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <div className="flex items-center bg-[#1a0806] rounded-lg border border-white/10 p-1">
            <button
              onClick={() => changeView('grid')}
              className={`p-1.5 rounded-md transition ${view === 'grid' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`}
              title="Vista de tarjetas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => changeView('list')}
              className={`p-1.5 rounded-md transition ${view === 'list' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`}
              title="Vista de lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs mobile / desktop */}
      <div className="md:hidden">
        <select
          value={tab}
          onChange={(e) => handleTabChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-[#1a0806] text-white text-sm focus:border-[#C9A96E] focus:outline-none appearance-none"
        >
          {TABS.map((t) => {
            const count = t.statuses ? orders.filter((o) => t.statuses.includes(o.status)).length : orders.length
            return <option key={t.value} value={t.value}>{t.label} ({count})</option>
          })}
        </select>
      </div>

      <div className="hidden md:flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.statuses ? orders.filter((o) => t.statuses.includes(o.status)).length : orders.length
          const active = tab === t.value
          return (
            <button
              key={t.value}
              onClick={() => handleTabChange(t.value)}
              className={`px-3.5 py-1.5 text-xs rounded-full border transition flex items-center gap-2 ${
                active
                  ? 'bg-[#C9A96E] text-[#2b0f0b] border-[#C9A96E] font-bold shadow-md'
                  : 'bg-[#23120B] text-white/60 border-white/10 hover:bg-[#341D14] hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-black/20 text-black' : 'bg-white/10'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {filtered.length === 0 ? (
        <div className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-2xl p-12 text-center shadow-lg shadow-black/40">
          <p className="text-[#F5EDE3]/70 text-sm">
            {query ? 'No hay pedidos que coincidan con la búsqueda.' : 'No hay pedidos en esta categoría.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order, index) => (
            <div
              key={order.id || `order-${index}`}
              className={`relative flex flex-col bg-[#2A1810]/90 backdrop-blur-md border rounded-xl p-4 transition-all duration-300 shadow-lg shadow-black/40 ${getCardBorder(order.status)}`}
            >
              {!['delivered', 'cancelled'].includes(order.status) && (
                <button 
                  onClick={() => setCancelModal(order.id)}
                  className="absolute top-3 right-3 text-white/30 hover:text-red-400 transition z-10 p-1"
                  title="Cancelar pedido"
                >
                  <X size={14} />
                </button>
              )}

              <div className="mb-2 pr-6">
                <p className="font-mono text-sm text-[#F5EDE3] font-bold mb-1">{order.order_number}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#C9A96E]/80">
                  <Calendar size={11} className="text-[#C9A96E]" />
                  <span suppressHydrationWarning>{formatDate(order.created_at)}</span>
                </div>
              </div>

              <div className="mb-3">
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-[#F5EDE3] font-semibold text-base">
                  <User size={14} className="text-[#C9A96E]/70" />
                  {order.customer_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#C9A96E]/70">
                  <Phone size={12} className="text-[#C9A96E]/70" />
                  {order.customer_phone}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 mb-3 mt-auto">
                <p className="text-[9px] uppercase text-[#C9A96E]/60 mb-0.5 font-semibold tracking-wider">Total</p>
                <p className="font-serif text-xl text-[#F5EDE3] font-bold">${Number(order.total).toLocaleString('es-AR')}</p>
              </div>

              <div>{renderActions(order)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-xl overflow-hidden shadow-lg shadow-black/40 w-full max-w-full">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-[#1a0806] text-[#C9A96E]/70 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nro.</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, index) => (
                  <tr key={order.id || `order-list-${index}`} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono text-[#F5EDE3] font-bold">{order.order_number}</td>
                    <td className="px-4 py-3 text-[#F5EDE3]">{order.customer_name}</td>
                    <td className="px-4 py-3 text-[#C9A96E]/70" suppressHydrationWarning>{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 font-bold text-[#F5EDE3]">${Number(order.total).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/pedidos/${order.id}`} className="inline-flex items-center gap-1 text-[#C9A96E] hover:text-white transition">
                        Ver <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#2A1810] border border-red-500/30 p-6 rounded-xl max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={22} />
              <h3 className="font-serif text-lg text-white">¿Cancelar pedido?</h3>
            </div>
            <p className="text-white/70 text-xs mb-5">
              Esta acción moverá el pedido a la lista de cancelados. No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition text-xs">
                Volver
              </button>
              <button onClick={handleCancel} className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium text-xs">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}