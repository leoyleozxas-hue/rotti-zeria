// lib/constants/nav.js
//
// Navegación del panel: una sola fuente para el sidebar, el título del topbar y
// los filtros. Antes el título salía de un ternario que sólo conocía dos rutas.

import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Sandwich,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from 'lucide-react'
import { CATEGORIES } from './catalog'

export const ADMIN_NAV = [
  {
    group: 'Operación',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      {
        href: '/admin/pedidos',
        label: 'Pedidos',
        icon: ShoppingBag,
        children: [
          { label: 'Todos', href: '/admin/pedidos' },
          { label: 'Nuevos', href: '/admin/pedidos?estado=new' },
          { label: 'En preparación', href: '/admin/pedidos?estado=preparing' },
          { label: 'Listos', href: '/admin/pedidos?estado=ready' },
          { label: 'Historial', href: '/admin/pedidos?estado=history' },
        ],
      },
    ],
  },
  {
    group: 'Catálogo',
    items: [
      {
        href: '/admin/productos',
        label: 'Productos',
        icon: Package,
        children: [
          { label: 'Todos', href: '/admin/productos' },
          ...CATEGORIES.map((c) => ({
            label: c,
            href: `/admin/productos?categoria=${encodeURIComponent(c)}`,
          })),
        ],
      },
      // Todavía no existe la pantalla: se muestra como "pronto" en vez de
      // mandar al dueño a un 404.
      { label: 'Destacados', icon: Star, soon: true },
      { label: 'Categorías', icon: Tag, soon: true },
    ],
  },
  {
    group: 'Comercial',
    items: [
      { label: 'Lunch & Eventos', icon: Sandwich, soon: true },
      { label: 'Mensajes', icon: MessageSquare, soon: true },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { label: 'Clientes', icon: Users, soon: true },
      { label: 'Configuración', icon: Settings, soon: true },
    ],
  },
]

/**
 * Título del topbar por ruta: se elige el prefijo más largo que coincida, así
 * `/admin/pedidos/:id` gana sobre `/admin/pedidos`.
 */
const ROUTE_TITLES = [
  ['/admin/pedidos/', 'Detalle de pedido'],
  ['/admin/pedidos', 'Pedidos'],
  ['/admin/productos/nuevo', 'Nuevo producto'],
  ['/admin/productos/', 'Editar producto'],
  ['/admin/productos', 'Productos'],
  ['/admin', 'Dashboard'],
]

export function titleForPath(pathname = '') {
  for (const [prefix, title] of ROUTE_TITLES) {
    const matches = prefix.endsWith('/')
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`)
    if (matches) return title
  }
  return 'Panel'
}
