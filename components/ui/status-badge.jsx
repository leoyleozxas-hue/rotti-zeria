// components/ui/status-badge.jsx
//
// El color del estado sale del mapa único de lib/constants/orders.js.
// `pulse` se reserva para lo que pide acción (pending): si todo pulsa, nada
// transmite urgencia.

import { ORDER_STATUS, ORDER_TONES } from '@/lib/constants/orders'

export default function StatusBadge({ status, size = 'sm', pulse }) {
  const meta = ORDER_STATUS[status]
  const tone = ORDER_TONES[meta?.tone || 'closed']
  const label = meta?.label || status

  const sizing =
    size === 'md'
      ? 'px-3 py-1.5 text-[11px]'
      : 'px-2.5 py-1 text-[10px]'

  const shouldPulse = pulse ?? meta?.tone === 'pending'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.11em] ${sizing} ${tone.badge}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot} ${shouldPulse ? 'animate-pulse' : ''}`}
      />
      {label}
    </span>
  )
}

/** Punto de color suelto, para leyendas y filtros. */
export function StatusDot({ status }) {
  const meta = ORDER_STATUS[status]
  const tone = ORDER_TONES[meta?.tone || 'closed']
  return <span aria-hidden className={`h-2 w-2 rounded-full ${tone.dot}`} />
}
