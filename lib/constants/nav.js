// lib/constants/nav.js
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Sandwich,
  ShoppingBag,
  Star,
  Tag,
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
        badgeKey: 'pendingOrders',
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
      { label: 'Destacados', icon: Star, soon: true },
      { label: 'Categorías', icon: Tag, soon: true },
    ],
  },
  {
    group: 'Comercial',
    items: [
      { href: '/admin/lunch', label: 'Lunch & Eventos', icon: Sandwich },
      {
        href: '/admin/consultas',
        label: 'Consultas',
        icon: MessageSquare,
        badgeKey: 'newConsultas',
      },
    ],
  },
]

const ROUTE_TITLES = [
  ['/admin/preview', 'Banco de pruebas'],
  ['/admin/pedidos/', 'Detalle de pedido'],
  ['/admin/pedidos', 'Pedidos'],
  ['/admin/productos/nuevo', 'Nuevo producto'],
  ['/admin/productos/', 'Editar producto'],
  ['/admin/productos', 'Productos'],
  ['/admin/lunch/nuevo', 'Nuevo Combo'],
  ['/admin/lunch/', 'Editar Combo'],
  ['/admin/lunch', 'Lunch & Eventos'],
  ['/admin/consultas', 'Consultas'],
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