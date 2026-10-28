// lib/constants/orders.js
//
// Fuente ÚNICA de verdad para los estados de pedido.
// Antes cada pantalla tenía su propio mapa de labels y colores, así que el
// mismo estado se veía ámbar en el tablero, violeta en el detalle y gris en el
// dashboard. Si agregás un estado, se agrega acá y aparece bien en todas lados.

/**
 * tone: familia semántica de color (define el badge, el borde de tarjeta y la
 * barra de acento). Cuatro familias alcanzan para todo el flujo.
 */
export const ORDER_STATUS = {
  pending_payment: { label: 'Pendiente de pago', tone: 'pending', group: 'new' },
  payment_review: { label: 'Revisar pago', tone: 'pending', group: 'new' },
  confirmed: { label: 'Confirmado', tone: 'active', group: 'kitchen' },
  preparing: { label: 'Preparando', tone: 'active', group: 'kitchen' },
  ready: { label: 'Listo para retirar', tone: 'ready', group: 'ready' },
  delivered: { label: 'Entregado', tone: 'closed', group: 'history' },
  cancelled: { label: 'Cancelado', tone: 'closed', group: 'history' },
}

export const ORDER_TONES = {
  pending: {
    badge: 'border-pending/35 bg-pending/15 text-pending',
    dot: 'bg-pending',
    accent: 'bg-pending',
    ring: 'hover:border-pending/50',
    glow: 'hover:shadow-[0_20px_44px_-16px_rgb(232_176_75_/_0.25)]',
  },
  active: {
    badge: 'border-active/35 bg-active/15 text-active',
    dot: 'bg-active',
    accent: 'bg-active',
    ring: 'hover:border-active/50',
    glow: 'hover:shadow-[0_20px_44px_-16px_rgb(69_185_138_/_0.22)]',
  },
  ready: {
    badge: 'border-ready/35 bg-ready/15 text-ready',
    dot: 'bg-ready',
    accent: 'bg-ready',
    ring: 'hover:border-ready/50',
    glow: 'hover:shadow-[0_20px_44px_-16px_rgb(75_179_212_/_0.22)]',
  },
  closed: {
    badge: 'border-white/15 bg-white/8 text-white/65',
    dot: 'bg-white/40',
    accent: 'bg-white/25',
    ring: 'hover:border-white/30',
    glow: 'hover:shadow-lift',
  },
}

/** Tabs del tablero. `statuses: null` = todos. */
export const ORDER_TABS = [
  { value: 'all', label: 'Todos', statuses: null },
  { value: 'new', label: 'Nuevos', statuses: ['pending_payment', 'payment_review'] },
  { value: 'preparing', label: 'En preparación', statuses: ['confirmed', 'preparing'] },
  { value: 'ready', label: 'Listos', statuses: ['ready'] },
  { value: 'history', label: 'Historial', statuses: ['delivered', 'cancelled'] },
]

/** Siguiente paso lógico del flujo (lo que el botón principal hace). */
export const NEXT_STATUS = {
  pending_payment: { to: 'confirmed', label: 'Confirmar y preparar', icon: 'chef' },
  payment_review: { to: 'confirmed', label: 'Confirmar y preparar', icon: 'chef' },
  confirmed: { to: 'preparing', label: 'Empezar a preparar', icon: 'chef' },
  preparing: { to: 'ready', label: 'Marcar como listo', icon: 'check' },
  ready: { to: 'delivered', label: 'Entregar pedido', icon: 'package' },
  delivered: null,
  cancelled: null,
}

export const statusLabel = (status) => ORDER_STATUS[status]?.label || status
export const statusTone = (status) => ORDER_TONES[ORDER_STATUS[status]?.tone || 'closed']

export const isOpenOrder = (status) => !['delivered', 'cancelled'].includes(status)

/** Lista ordenada para selects y botones de estado. */
export const STATUS_LIST = Object.entries(ORDER_STATUS).map(([value, meta]) => ({ value, ...meta }))
