// components/admin/ConsultasTable.jsx
'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MessageSquare, Loader2, Check, Eye, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  new: { label: 'Nueva', color: 'bg-amber-400/20 text-amber-100 border-amber-300/40', icon: MessageSquare },
  read: { label: 'Leída', color: 'bg-sky-400/20 text-sky-100 border-sky-300/40', icon: Eye },
  completed: { label: 'Atendida', color: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40', icon: Check },
}

// Buscá esta constante en tu OrdersBoard.jsx y cambiala por esta:
const TABS = [
  // "Todos" ahora significa "Todo lo que está en producción activa"
  { value: 'all', label: 'Todos', statuses: ['pending_payment', 'payment_review', 'confirmed', 'preparing', 'ready'] },
  { value: 'new', label: 'Nuevos', statuses: ['pending_payment', 'payment_review'] },
  { value: 'preparing', label: 'En preparación', statuses: ['confirmed', 'preparing'] },
  { value: 'ready', label: 'Listos', statuses: ['ready'] },
  { value: 'history', label: 'Historial', statuses: ['delivered', 'cancelled'] },
]

function formatDate(dateString) {
  const d = new Date(dateString)
  const day = d.getDate().toString().padStart(2, '0')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day} ${months[d.getMonth()]} · ${hours}:${minutes}`
}

export default function ConsultasTable({ consultas }) {
  const router = useRouter()
  const [tab, setTab] = useState('all')
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState(null)

  const filtered = useMemo(() => {
    const cfg = TABS.find(t => t.value === tab)
    return cfg?.statuses ? consultas.filter(c => cfg.statuses.includes(c.status)) : consultas
  }, [consultas, tab])

  async function updateStatus(id, newStatus) {
    setUpdatingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('consultas').update({ status: newStatus }).eq('id', id)
    
    if (error) {
      toast.error('Error al actualizar')
    } else {
      toast.success('Consulta actualizada')
      startTransition(() => router.refresh())
    }
    setUpdatingId(null)
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => {
          const count = t.statuses ? consultas.filter(c => t.statuses.includes(c.status)).length : consultas.length
          const active = tab === t.value
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 text-sm rounded-full border transition flex items-center gap-2 ${
                active
                  ? 'bg-[#E0C89A] text-[#2b0f0b] border-[#E0C89A] font-bold shadow-md'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 rounded-full ${active ? 'bg-black/20' : 'bg-white/10'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="border border-white/10 bg-white/5 rounded-2xl p-12 text-center">
          <MessageSquare className="mx-auto mb-3 text-white/30" size={32} />
          <p className="text-white/60">No hay consultas en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.new
            const Icon = cfg.icon
            return (
              <div key={c.id} className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:bg-white/8 transition">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${cfg.color} flex items-center gap-1.5`}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Clock size={11} /> {formatDate(c.created_at)}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Nombre</p>
                    <p className="text-sm text-white font-medium">{c.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Email</p>
                    <a href={`mailto:${c.email}`} className="text-sm text-[#E0C89A] hover:text-white transition truncate block">
                      {c.email}
                    </a>
                  </div>
                  {c.phone && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Teléfono</p>
                      <a href={`tel:${c.phone}`} className="text-sm text-[#E0C89A] hover:text-white transition">
                        {c.phone}
                      </a>
                    </div>
                  )}
                </div>

                <p className="text-sm text-white/80 whitespace-pre-wrap mb-4 leading-relaxed">
                  {c.message}
                </p>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2">
                  {c.status !== 'read' && (
                    <button
                      onClick={() => updateStatus(c.id, 'read')}
                      disabled={updatingId === c.id}
                      className="px-3 py-1.5 text-xs rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 hover:bg-sky-500/25 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {updatingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                      Marcar leída
                    </button>
                  )}
                  {c.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(c.id, 'completed')}
                      disabled={updatingId === c.id}
                      className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/25 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {updatingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Marcar atendida
                    </button>
                  )}
                  <a
                    href={`mailto:${c.email}?subject=Respuesta a tu consulta - Biarritz`}
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#E0C89A]/15 border border-[#E0C89A]/30 text-[#E0C89A] hover:bg-[#E0C89A]/25 transition flex items-center gap-1.5"
                  >
                    <Mail size={12} /> Responder
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}