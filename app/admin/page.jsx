// app/admin/page.jsx
//
// Dashboard: lo primero que mira el dueño. Responde tres preguntas en orden:
// cuánto entró, qué hay que hacer ahora, y qué se está vendiendo.

import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Package,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/page-header'
import Panel, { PanelHeader } from '@/components/ui/panel'
import StatusBadge from '@/components/ui/status-badge'
import EmptyState from '@/components/ui/empty-state'
import { ButtonLink } from '@/components/ui/button'

const money = (value) => `$${Math.round(Number(value)).toLocaleString('es-AR')}`

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date, days) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

async function getDashboardData() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, customer_name, pickup_date, pickup_time')

  if (error || !orders) return null

  const now = new Date()
  const today = startOfDay(now)

  const within = (from, to) =>
    orders.filter((o) => {
      const created = new Date(o.created_at)
      return created >= from && (!to || created < to)
    })

  const summarize = (list) => ({
    count: list.length,
    revenue: list
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + Number(o.total || 0), 0),
  })

  const todayList = within(today)
  const yesterdayList = within(addDays(today, -1), today)
  const weekList = within(addDays(today, -6))
  const prevWeekList = within(addDays(today, -13), addDays(today, -6))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthList = within(monthStart)
  const prevMonthList = within(prevMonthStart, monthStart)

  const pendingOrders = orders.filter((o) =>
    ['pending_payment', 'payment_review'].includes(o.status)
  )

  // Pedidos a retirar hoy (la pantalla que se imprime en la cocina).
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`

  const pickupsToday = orders
    .filter((o) => o.pickup_date === isoToday && !['delivered', 'cancelled'].includes(o.status))
    .sort((a, b) => String(a.pickup_time || '').localeCompare(String(b.pickup_time || '')))

  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)

  // Más vendidos de la última semana, a partir de los ítems de esos pedidos.
  const weekIds = weekList.map((o) => o.id)
  let topProducts = []
  if (weekIds.length) {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, quantity')
      .in('order_id', weekIds)

    if (items?.length) {
      const tally = new Map()
      for (const item of items) {
        const key = item.product_name || 'Sin nombre'
        tally.set(key, (tally.get(key) || 0) + Number(item.quantity || 0))
      }
      topProducts = [...tally.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
    }
  }

  return {
    today: summarize(todayList),
    yesterday: summarize(yesterdayList),
    week: summarize(weekList),
    prevWeek: summarize(prevWeekList),
    month: summarize(monthList),
    prevMonth: summarize(prevMonthList),
    pendingCount: pendingOrders.length,
    pickupsToday,
    recent,
    topProducts,
    avgTicket: weekList.length ? summarize(weekList).revenue / weekList.length : 0,
  }
}

function Delta({ current, previous }) {
  if (!previous) {
    return <span className="text-[10px] font-medium text-white/30">—</span>
  }
  const change = Math.round(((current - previous) / previous) * 100)
  if (change === 0) {
    return <span className="text-[10px] font-medium text-white/35">igual</span>
  }
  const up = change > 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
        up ? 'text-active' : 'text-red-300'
      }`}
    >
      <Icon size={11} aria-hidden />
      {Math.abs(change)}%
    </span>
  )
}

function MetricCard({ label, data, previous, compareLabel, icon: Icon, index }) {
  return (
    <Panel
      tone="glass"
      className="anim-rise overflow-hidden"
      style={{ '--i': index }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft/70">
            {label}
          </p>
          <p className="tabular mt-2 font-serif text-2xl leading-none text-white md:text-3xl">
            {money(data.revenue)}
          </p>
        </div>
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold-soft"
        >
          <Icon size={15} />
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
        <span className="tabular text-xs text-white/45">
          {data.count} {data.count === 1 ? 'pedido' : 'pedidos'}
        </span>
        <span className="flex items-center gap-1.5">
          <Delta current={data.revenue} previous={previous?.revenue} />
          <span className="text-[10px] text-white/25">{compareLabel}</span>
        </span>
      </div>
    </Panel>
  )
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <Panel tone="glass">
        <EmptyState
          icon={Receipt}
          title="No pudimos cargar el resumen"
          description="Revisá la conexión con la base de datos y volvé a intentar."
        />
      </Panel>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Resumen"
        title="Dashboard"
        description="Cómo viene el día, qué hay que preparar y qué se está vendiendo."
        actions={
          <ButtonLink href="/admin/productos/nuevo" variant="secondary" size="md">
            <Plus size={16} aria-hidden />
            Nuevo producto
          </ButtonLink>
        }
      />

      {/* Lo que pide acción va arriba de todo */}
      {data.pendingCount > 0 && (
        <Link
          href="/admin/pedidos?estado=new"
          className="anim-rise group flex items-center gap-4 rounded-card border border-pending/35 bg-gradient-to-r from-pending/18 to-transparent p-4 transition hover:border-pending/60 hover:from-pending/25"
        >
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pending/40 bg-pending/20 text-pending"
          >
            <Clock size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">
              {data.pendingCount} {data.pendingCount === 1 ? 'pedido espera' : 'pedidos esperan'}{' '}
              confirmación
            </p>
            <p className="mt-0.5 text-xs text-pending/70">
              Sin confirmar no se prepara: son los que más demoran al cliente.
            </p>
          </div>
          <ArrowRight
            size={16}
            aria-hidden
            className="shrink-0 text-pending transition group-hover:translate-x-0.5"
          />
        </Link>
      )}

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          index={0}
          label="Hoy"
          data={data.today}
          previous={data.yesterday}
          compareLabel="vs ayer"
          icon={Wallet}
        />
        <MetricCard
          index={1}
          label="Últimos 7 días"
          data={data.week}
          previous={data.prevWeek}
          compareLabel="vs semana previa"
          icon={TrendingUp}
        />
        <MetricCard
          index={2}
          label="Este mes"
          data={data.month}
          previous={data.prevMonth}
          compareLabel="vs mes previo"
          icon={Receipt}
        />
        <Panel tone="glass" className="anim-rise" style={{ '--i': 3 }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft/70">
                Ticket promedio
              </p>
              <p className="tabular mt-2 font-serif text-2xl leading-none text-white md:text-3xl">
                {money(data.avgTicket)}
              </p>
            </div>
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold-soft"
            >
              <Package size={15} />
            </span>
          </div>
          <p className="mt-4 border-t border-white/8 pt-3 text-xs text-white/45">
            Promedio de los últimos 7 días
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Para hoy */}
        <Panel tone="glass" padded={false} className="anim-rise lg:col-span-2">
          <PanelHeader
            title="Para retirar hoy"
            action={
              <span className="tabular rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                {data.pickupsToday.length}
              </span>
            }
          />

          {data.pickupsToday.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Sin retiros para hoy"
              description="Los pedidos con fecha de hoy aparecen acá, ordenados por hora."
            />
          ) : (
            <ul className="divide-y divide-white/6">
              {data.pickupsToday.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.04]"
                  >
                    <span className="tabular w-12 shrink-0 rounded-md border border-white/10 bg-ink-950/60 py-1 text-center text-[11px] font-semibold text-gold-soft">
                      {order.pickup_time || '—'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {order.customer_name}
                      </span>
                      <span className="font-mono text-[10px] text-white/40">
                        {order.order_number}
                      </span>
                    </span>
                    <StatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Más vendidos */}
        <Panel tone="glass" padded={false} className="anim-rise lg:col-span-3">
          <PanelHeader title="Lo más vendido · 7 días" />

          {data.topProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Todavía sin ventas esta semana"
              description="Cuando entren pedidos, acá vas a ver qué sale más."
            />
          ) : (
            <ul className="divide-y divide-white/6">
              {data.topProducts.map((product, index) => {
                const max = data.topProducts[0].quantity || 1
                const width = Math.max(6, Math.round((product.quantity / max) * 100))
                return (
                  <li key={product.name} className="px-5 py-3">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm text-white/85">
                        <span className="tabular mr-2 text-[11px] text-white/30">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {product.name}
                      </span>
                      <span className="tabular shrink-0 text-xs font-semibold text-gold-soft">
                        {product.quantity} u.
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Últimos pedidos */}
      <Panel tone="glass" padded={false} className="anim-rise">
        <PanelHeader
          title="Últimos pedidos"
          action={
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1 text-xs font-medium text-gold-soft transition hover:text-white"
            >
              Ver todos
              <ArrowRight size={12} aria-hidden />
            </Link>
          }
        />

        {data.recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Todavía no hay pedidos"
            description="Cuando entre el primero, aparece acá con su estado."
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '620px' }}>
              <thead>
                <tr className="border-b border-white/8">
                  {['Nro.', 'Cliente', 'Total', 'Estado'].map((label, i) => (
                    <th
                      key={label}
                      scope="col"
                      className={`px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 ${
                        i === 2 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent.map((order, index) => (
                  <tr
                    key={order.id || index}
                    className="anim-rise border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.035]"
                    style={{ '--i': index }}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gold-soft">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-3 text-white/85">{order.customer_name}</td>
                    <td className="tabular px-5 py-3 text-right font-semibold text-white">
                      {money(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
