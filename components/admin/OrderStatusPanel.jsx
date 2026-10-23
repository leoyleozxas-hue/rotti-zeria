// components/admin/OrderStatusPanel.jsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const FLOW = {
  pending_payment: { next: 'confirmed', nextLabel: 'Confirmar pago' },
  payment_review: { next: 'confirmed', nextLabel: 'Confirmar pago' },
  confirmed: { next: 'preparing', nextLabel: 'Empezar a preparar' },
  preparing: { next: 'ready', nextLabel: 'Marcar como listo' },
  ready: { next: 'delivered', nextLabel: 'Marcar como entregado' },
  delivered: null,
  cancelled: null,
}

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  payment_review: 'Revisar pago',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const glass =
  'relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]'

export default function OrderStatusPanel({ order }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const flow = FLOW[order.status]
  const canCancel = !['delivered', 'cancelled'].includes(order.status)

  const updateStatus = async (newStatus) => {
    if (newStatus === order.status) return
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)

    if (error) {
      toast.error('Error: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Estado actualizado')
    setLoading(false)
    startTransition(() => router.refresh())
  }

  const busy = loading || isPending

  return (
    <div className={`${glass} rounded-2xl p-5 md:p-6`}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="font-serif text-xl text-white">Acciones del pedido</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-[#E0C89A] hover:text-white transition underline underline-offset-4"
        >
          {showAll ? 'Ocultar opciones' : 'Ver todos los estados'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Botón Principal (Siguiente paso lógico) */}
        {flow && (
          <button
            onClick={() => updateStatus(flow.next)}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-[#E0C89A] text-[#2b0f0b] py-4 rounded-xl font-bold text-lg hover:bg-white transition disabled:opacity-50 shadow-lg shadow-[#E0C89A]/20"
          >
            {busy ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ArrowRight size={20} />
            )}
            {flow.nextLabel}
          </button>
        )}

        {/* Botón Secundario (Cancelar) */}
        {canCancel && (
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-50"
          >
            <X size={16} />
            Cancelar pedido
          </button>
        )}
      </div>

      {/* Opciones avanzadas (Ver todos los estados) */}
      {showAll && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-[#E0C89A] mb-3">
            Forzar cambio a cualquier estado:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => updateStatus(value)}
                disabled={busy || value === order.status}
                className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                  value === order.status
                    ? 'bg-[#E0C89A]/25 border-[#E0C89A]/50 text-white font-bold'
                    : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/15 hover:text-white'
                } disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}