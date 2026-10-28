// components/admin/OrdersBoard.jsx
//
// Tablero de pedidos: grilla de tarjetas o lista. Las tarjetas se ordenan por
// estado con una barra de acento de color, así la cola de trabajo se lee de un
// vistazo. Toda la semántica de estados viene de lib/constants/orders.js.

'use client'

import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Eye,
  PackageCheck,
  Phone,
  SearchX,
  User,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  NEXT_STATUS,
  ORDER_TABS,
  isOpenOrder,
  statusTone,
} from '@/lib/constants/orders'
import DataTable, { Cell, Row } from '@/components/ui/data-table'
import EmptyState from '@/components/ui/empty-state'
import SearchField from '@/components/ui/search-field'
import Toolbar, { ResultCount } from '@/components/ui/toolbar'
import ViewToggle from '@/components/ui/view-toggle'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import StatusBadge from '@/components/ui/status-badge'
import { Button, IconButton, IconLink } from '@/components/ui/button'
import useViewMode from '@/lib/hooks/useViewMode'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDate(value) {
  const d = new Date(value)
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS[d.getMonth()]
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} · ${hours}:${minutes}`
}

const money = (value) => `$${Number(value).toLocaleString('es-AR')}`

const ACTION_ICONS = { chef: ChefHat, check: CheckCircle2, package: PackageCheck }

export default function OrdersBoard({ initialOrders = [] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, changeView] = useViewMode('admin-orders-view')
  // Cambio de estado optimista: se ve al instante y se revierte solo cuando el
  // server manda datos nuevos (sin efecto de sincronización ni estado duplicado).
  const [orders, applyOptimisticStatus] = useOptimistic(initialOrders, (state, patch) =>
    state.map((order) => (order.id === patch.id ? { ...order, status: patch.status } : order))
  )
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [pendingCancel, setPendingCancel] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const estadoUrl = searchParams.get('estado') || 'all'
  const tab = ORDER_TABS.some((t) => t.value === estadoUrl) ? estadoUrl : 'all'

  const counts = useMemo(() => {
    return Object.fromEntries(
      ORDER_TABS.map((t) => [
        t.value,
        t.statuses ? orders.filter((o) => t.statuses.includes(o.status)).length : orders.length,
      ])
    )
  }, [orders])

  const filtered = useMemo(() => {
    const config = ORDER_TABS.find((t) => t.value === tab)
    let list = config?.statuses ? orders.filter((o) => config.statuses.includes(o.status)) : orders

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

  function changeTab(next) {
    router.push(next === 'all' ? '/admin/pedidos' : `/admin/pedidos?estado=${next}`, {
      scroll: false,
    })
  }

  async function updateStatus(order, nextStatus) {
    setBusyId(order.id)

    startTransition(async () => {
      applyOptimisticStatus({ id: order.id, status: nextStatus })

      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', order.id)

      setBusyId(null)

      if (error) {
        toast.error('No se pudo actualizar el pedido', { description: error.message })
        return
      }

      toast.success('Pedido actualizado', { description: order.order_number })
      router.refresh()
    })
  }

  return (
    <div className="w-full space-y-4">
      <Toolbar
        aside={
          <>
            <ResultCount shown={filtered.length} total={orders.length} noun="pedidos" />
            <ViewToggle value={view} onChange={changeView} />
          </>
        }
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar por número, nombre o teléfono…"
          label="Buscar pedidos"
          className="sm:max-w-sm"
        />
      </Toolbar>

      {/* Tabs: pills en desktop, select en móvil */}
      <div className="flex flex-col gap-2">
        <div className="hidden flex-wrap gap-1.5 md:flex" role="tablist" aria-label="Estado del pedido">
          {ORDER_TABS.map((t) => {
            const active = tab === t.value
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeTab(t.value)}
                className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition ${
                  active
                    ? 'border-gold/45 bg-gold/15 font-semibold text-gold-soft'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white'
                }`}
              >
                {t.label}
                <span
                  className={`tabular rounded-full px-1.5 text-[10px] font-semibold ${
                    active ? 'bg-gold/20 text-gold-soft' : 'bg-white/8 text-white/50'
                  }`}
                >
                  {counts[t.value]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative md:hidden">
          <select
            value={tab}
            onChange={(e) => changeTab(e.target.value)}
            aria-label="Filtrar pedidos por estado"
            className="h-10 w-full appearance-none rounded-field border border-white/12 bg-ink-950/70 pl-3 pr-9 text-sm text-cream"
          >
            {ORDER_TABS.map((t) => (
              <option key={t.value} value={t.value} className="bg-ink-900">
                {t.label} ({counts[t.value]})
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-white/10 bg-ink-900/60 shadow-panel">
          <EmptyState
            icon={SearchX}
            title={query ? 'Sin resultados' : 'No hay pedidos acá'}
            description={
              query
                ? `Ningún pedido coincide con "${query}".`
                : 'Cuando entre un pedido en esta categoría aparece automáticamente.'
            }
            action={
              query ? (
                <Button variant="secondary" size="md" onClick={() => setQuery('')}>
                  Limpiar búsqueda
                </Button>
              ) : null
            }
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              index={index}
              busy={busyId === order.id || isPending}
              expanded={expanded === order.id}
              onToggleItems={() => setExpanded(expanded === order.id ? null : order.id)}
              onAdvance={(next) => updateStatus(order, next)}
              onCancel={() => setPendingCancel(order)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          minWidth="780px"
          columns={[
            { key: 'number', label: 'Nro.' },
            { key: 'customer', label: 'Cliente' },
            { key: 'date', label: 'Fecha' },
            { key: 'total', label: 'Total', align: 'right' },
            { key: 'status', label: 'Estado' },
            { key: 'actions', label: '', align: 'right' },
          ]}
        >
          {filtered.map((order, index) => (
            <Row key={order.id} index={index}>
              <Cell className="font-mono text-xs font-semibold text-gold-soft">
                {order.order_number}
              </Cell>
              <Cell>
                <span className="block font-medium text-white">{order.customer_name}</span>
                <span className="text-xs text-white/40">{order.customer_phone}</span>
              </Cell>
              <Cell className="whitespace-nowrap text-xs text-white/45">
                <span suppressHydrationWarning>{formatDate(order.created_at)}</span>
              </Cell>
              <Cell align="right" className="tabular font-semibold text-white">
                {money(order.total)}
              </Cell>
              <Cell>
                <StatusBadge status={order.status} />
              </Cell>
              <Cell align="right">
                <div className="flex items-center justify-end gap-1.5">
                  <IconLink
                    href={`/admin/pedidos/${order.id}`}
                    label={`Ver pedido ${order.order_number}`}
                    variant="secondary"
                    size="icon"
                  >
                    <Eye size={14} aria-hidden />
                  </IconLink>
                  {isOpenOrder(order.status) && (
                    <IconButton
                      label={`Cancelar pedido ${order.order_number}`}
                      variant="danger"
                      size="icon"
                      onClick={() => setPendingCancel(order)}
                    >
                      <X size={14} aria-hidden />
                    </IconButton>
                  )}
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      )}

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        destructive
        title="¿Cancelar este pedido?"
        description={
          pendingCancel
            ? `El pedido ${pendingCancel.order_number} de ${pendingCancel.customer_name} pasa a cancelado. No se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        onConfirm={() => {
          updateStatus(pendingCancel, 'cancelled')
          setPendingCancel(null)
        }}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  )
}

function OrderCard({ order, index, busy, expanded, onToggleItems, onAdvance, onCancel }) {
  const tone = statusTone(order.status)
  const next = NEXT_STATUS[order.status]
  const Icon = next ? ACTION_ICONS[next.icon] : null
  const itemCount = order.order_items?.length || 0

  return (
    <article
      style={{ '--i': index }}
      className={`anim-rise group relative flex flex-col overflow-hidden rounded-card border border-white/10 bg-ink-800/75 shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${tone.ring} ${tone.glow}`}
    >
      {/* Barra de acento: el estado se ve desde lejos, sin leer */}
      <span aria-hidden className={`h-[3px] w-full ${tone.accent}`} />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-white">{order.order_number}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/40">
              <Calendar size={11} aria-hidden />
              <span suppressHydrationWarning>{formatDate(order.created_at)}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={order.status} />
            {isOpenOrder(order.status) && (
              <IconButton
                label={`Cancelar pedido ${order.order_number}`}
                variant="ghost"
                size="iconSm"
                onClick={onCancel}
                className="rounded-full border border-white/10 bg-ink-950/60 text-white/45 backdrop-blur hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-200"
              >
                <X size={12} aria-hidden />
              </IconButton>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-2 truncate text-sm font-semibold text-white/90">
            <User size={13} aria-hidden className="shrink-0 text-white/35" />
            {order.customer_name}
          </p>
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-2 text-xs text-white/50 transition hover:text-gold-soft"
          >
            <Phone size={12} aria-hidden className="shrink-0" />
            {order.customer_phone}
          </a>
        </div>

        {itemCount > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={onToggleItems}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between rounded-field border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-white/55 transition hover:bg-white/8 hover:text-white"
            >
              <span>
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </span>
              <ChevronDown
                size={13}
                aria-hidden
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>

            {expanded && (
              <ul className="mt-1.5 space-y-1 rounded-field border border-white/8 bg-ink-950/60 p-3">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-[11px] text-white/65">
                    <span className="truncate">
                      <span className="tabular mr-1 font-semibold text-gold-soft">
                        {item.quantity}×
                      </span>
                      {item.product_name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/8 pt-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Total
            </p>
            <p className="tabular font-serif text-xl font-semibold text-white">{money(order.total)}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <IconLink
              href={`/admin/pedidos/${order.id}`}
              label={`Ver pedido ${order.order_number}`}
              variant="secondary"
              size="icon"
            >
              <Eye size={14} aria-hidden />
            </IconLink>

            {next && (
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={() => onAdvance(next.to)}
              >
                {Icon && <Icon size={14} aria-hidden />}
                {next.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
