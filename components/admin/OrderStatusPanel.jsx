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
    <div className={`${glass} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-serif text-lg text-white">Acciones</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-white/50 hover:text-white transition"
        >
          {showAll ? 'Ocultar opciones' : 'Ver todos los estados'}
        </button>
      </div>

      <p className="text-sm text-white/55 mb-5">
        Estado actual:{' '}
        <strong className="text-white">
          {STATUS_LABELS[order.status] || order.status}
        </strong>
      </p>

      <div className="flex flex-wrap gap-3">
        {flow && (
          <button
            onClick={() => updateStatus(flow.next)}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0C89A] to-[#C9A96E] text-[#2b0f0b] px-6 py-3 rounded-full font-medium hover:from-white hover:to-[#E0C89A] transition disabled:opacity-50 shadow-[0_4px_20px_rgba(201,169,110,.35)]"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            {flow.nextLabel}
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm text-red-200 border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-50"
          >
            <X size={14} />
            Cancelar pedido
          </button>
        )}
      </div>

      {showAll && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/50 mb-3">
            Cambiar manualmente a cualquier estado:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => updateStatus(value)}
                disabled={busy || value === order.status}
                className={`px-3 py-1.5 text-xs rounded-full border transition ${
                  value === order.status
                    ? 'bg-[#E0C89A]/25 border-[#E0C89A]/50 text-white'
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