// components/admin/OrderStatusPanel.jsx
//
// Acciones sobre un pedido. El botón principal es siempre el siguiente paso
// lógico del flujo (definido en lib/constants/orders.js), no una lista de
// estados donde uno puede equivocarse de orden.

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, ChefHat, Loader2, PackageCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { NEXT_STATUS, ORDER_STATUS, STATUS_LIST } from '@/lib/constants/orders'
import Panel from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import StatusBadge from '@/components/ui/status-badge'

const ACTION_ICONS = { chef: ChefHat, check: CheckCircle2, package: PackageCheck }

export default function OrderStatusPanel({ order }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const next = NEXT_STATUS[order.status]
  const NextIcon = next ? ACTION_ICONS[next.icon] : null
  const canCancel = !['delivered', 'cancelled'].includes(order.status)
  const busy = loading || isPending

  async function updateStatus(newStatus) {
    if (newStatus === order.status) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)

    setLoading(false)

    if (error) {
      toast.error('No se pudo cambiar el estado', { description: error.message })
      return
    }

    toast.success('Estado actualizado', {
      description: ORDER_STATUS[newStatus]?.label || newStatus,
    })
    startTransition(() => router.refresh())
  }

  return (
    <>
      <Panel tone="glass">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-base text-white">Acciones del pedido</h2>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
            className="text-[11px] font-medium text-gold-soft/80 underline underline-offset-4 transition hover:text-white"
          >
            {showAll ? 'Ocultar estados' : 'Ver todos los estados'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {next && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => updateStatus(next.to)}
            >
              {busy ? (
                <Loader2 size={17} aria-hidden className="animate-spin" />
              ) : (
                NextIcon && <NextIcon size={17} aria-hidden />
              )}
              {next.label}
            </Button>
          )}

          {!next && order.status === 'delivered' && (
            <p className="rounded-field border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-center text-xs text-white/45">
              Pedido entregado. No quedan acciones pendientes.
            </p>
          )}

          {canCancel && (
            <Button
              variant="danger"
              size="md"
              className="w-full"
              disabled={busy}
              onClick={() => setConfirmCancel(true)}
            >
              <X size={15} aria-hidden />
              Cancelar pedido
            </Button>
          )}
        </div>

        {showAll && (
          <div className="mt-5 border-t border-white/8 pt-4">
            <p className="mb-2.5 text-[11px] text-white/45">
              Forzar un estado puntual (queda registrado igual que el flujo normal):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_LIST.map(({ value }) => {
                const isCurrent = value === order.status
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={busy || isCurrent}
                    onClick={() => updateStatus(value)}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-100 ${
                      isCurrent
                        ? 'border-gold/45 bg-gold/15 font-semibold text-gold-soft'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {ORDER_STATUS[value].label}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">Actual</span>
              <StatusBadge status={order.status} />
              <ArrowRight size={11} aria-hidden className="text-white/25" />
            </div>
          </div>
        )}
      </Panel>

      {/* Fuera del Panel: `backdrop-blur` en un ancestro rompe position:fixed */}
      <ConfirmDialog
        open={confirmCancel}
        destructive
        title="¿Cancelar el pedido?"
        description={`El pedido ${order.order_number} pasa a cancelado. No se puede deshacer.`}
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        onConfirm={() => {
          setConfirmCancel(false)
          updateStatus('cancelled')
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  )
}
