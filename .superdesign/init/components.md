# Components — rotti-zeria (Biarritz)

Componentes compartidos del proyecto, con código fuente completo. Este archivo es la capa de descubrimiento: Superdesign lo usa para reproducir la UI real.

## Stack detectado

| Aspecto | Valor | Evidencia |
|---|---|---|
| Framework | React 19.3 | `package.json` |
| Meta-framework | Next.js 16.4.0 (App Router) | `package.json`, `app/` |
| Librería de componentes | **Ninguna** (componentes propios, sin shadcn/Radix/MUI) | `package.json` no tiene deps de UI |
| CSS | Tailwind CSS 4 (config inline vía `@theme`, sin `tailwind.config.*`) | `postcss.config.mjs`, `app/globals.css` |
| Iconos | `lucide-react` ^1.56.0 | imports en todos los componentes |
| Toasts | `sonner` ^2.0.8 (Toaster **solo** montado en `app/admin/layout.jsx`) | `app/admin/layout.jsx:13,298` |
| Estado cliente | `zustand` ^5.0.15 + `persist` | `lib/store/*` |
| Formularios | `react-hook-form` + `@hookform/resolvers` + `zod` ^4 | `checkout`, `ProductForm` |
| Backend / datos | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | `lib/supabase/*`, `proxy.js` |
| Alias de imports | `@/*` → `./*` (raíz del repo, **sin** `src/`) | `jsconfig.json` |
| Animaciones | CSS keyframes propias; **`motion` está instalado pero nunca se importa** | `app/globals.css:27-53` |

No existe directorio de primitivas tipo `components/ui/`. Los "primitivos" del proyecto son patrones de clase Tailwind repetidos a mano (ver `theme.md`, sección *Patrones de estilo*).

## Inventario

| Componente | Archivo | Usado en | Estado |
|---|---|---|---|
| `ProductCard` | `components/ProductCard.jsx` | `/`, `/productos`, `/productos/[id]` | vivo |
| `AddToCartSection` | `components/AddToCartSection.jsx` | `/productos/[id]` | vivo |
| `CartDrawer` | `components/cart/CartDrawer.jsx` | `StoreShell` (todas las rutas de tienda) | vivo |
| `ClearCartOnMount` | `components/ClearCartOnMount.jsx` | `/checkout/exito` | vivo |
| `OrderStatusPanel` | `components/admin/OrderStatusPanel.jsx` | `/admin/pedidos/[id]` **y** `/admin/productos/[id]` (duplicado) | vivo |
| `PrintButton` | `components/admin/PrintButton.jsx` | ambas rutas de detalle admin | vivo |
| `OrderNotifications` | `components/admin/OrderNotifications.jsx` | `/admin/pedidos` | vivo |
| `OrdersBoard` | `components/admin/OrdersBoard.jsx` | `/admin/pedidos` | vivo |
| `ProductsTable` | `components/admin/ProductsTable.jsx` | `/admin/productos` | vivo |
| `ProductForm` | `components/admin/ProductForm.jsx` | `/admin/productos/nuevo` | vivo (rama de edición muerta) |
| `OrdersTable` | `components/admin/OrdersTable.jsx` | — | **huérfano** |

Los shells y la navegación (`Header`, `Footer`, `StoreShell`, `app/layout.jsx`, `app/admin/layout.jsx`) están en `layouts.md`.

---

## ProductCard

- **Archivo**: `components/ProductCard.jsx`
- **Descripción**: Tarjeta de producto del catálogo; imagen cuadrada, badge "Más vendido", corazón de favorito y botón "Agregar".
- **Props**: `product` (objeto Supabase: `id`, `name`, `description`, `price`, `category`, `image_url`)
- **Particularidades**: es un `<Link>` completo; los handlers internos hacen `preventDefault()` + `stopPropagation()`. Usa `mounted` para evitar mismatch de hidratación en el corazón.

```jsx
// components/ProductCard.jsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useEffect, useState } from 'react'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const isFavorite = useFavoritesStore((s) => product ? s.isFavorite(product.id) : false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!product) return null

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFav(product)
  }

  const heartClass =
    mounted && isFavorite
      ? 'fill-red-500 text-red-500'
      : 'text-gray-400 group-hover:text-red-400'

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group relative flex flex-col bg-[#FCFAF8] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-[#EADFC8] hover:border-[#C9A96E]"
    >
      {/* Etiqueta "Más vendido" (Simulada para las facturas) */}
      {product.category === 'Facturas' && (
        <div className="absolute top-4 left-4 z-10 bg-[#C9A96E] text-[#2b0f0b] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
          Más vendido
        </div>
      )}

      {/* Corazón */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition"
        aria-label="Favorito"
      >
        <Heart size={18} className={`transition ${heartClass}`} />
      </button>

      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider text-[#9a8b7a] mb-1 font-semibold">
          {product.category}
        </span>
        <h3 className="font-serif text-lg text-[#2B0F0B] mb-2 leading-tight group-hover:text-[#5a1a10] transition font-semibold">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="font-serif text-xl text-[#2B0F0B] font-bold">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addItem(product)
            }}
            className="flex items-center gap-1 bg-[#2B0F0B] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#5a1a10] transition active:scale-95 shadow-md"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>
    </Link>
  )
}
```

---

## AddToCartSection

- **Archivo**: `components/AddToCartSection.jsx`
- **Descripción**: Selector de cantidad + botón "Añadir al pedido" + botón de favorito. Es el bloque de compra del detalle de producto.
- **Props**: `product`
- **Particularidades**: al agregar hace `router.push('/carrito')`; los controles son **rectangulares** (no pill), a diferencia del resto de la tienda.

```jsx
// components/AddToCartSection.jsx
'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'

export default function AddToCartSection({ product }) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))

  const [quantity, setQuantity] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    router.push('/carrito')
  }

    return (
    <div className="space-y-6">
      {/* Selector de cantidad (estilo minimalista) */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#2B0F0B]">Cantidad</span>
        <div className="flex items-center border border-[#EADFC8] bg-white">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 hover:bg-[#FAF7F2] flex items-center justify-center transition"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center font-semibold text-[#2B0F0B]">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 hover:bg-[#FAF7F2] flex items-center justify-center transition"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 bg-[#2B0F0B] text-white py-4 font-medium hover:bg-black transition"
        >
          <ShoppingBag size={18} />
          Añadir al pedido
        </button>

        <button
          onClick={() => toggleFav(product)}
          className="w-14 h-14 border border-[#EADFC8] bg-white hover:bg-[#FAF7F2] flex items-center justify-center transition"
          aria-label="Favorito"
        >
          <Heart
            size={20}
            className={`transition ${
              mounted && isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
```

---

## CartDrawer

- **Archivo**: `components/cart/CartDrawer.jsx`
- **Descripción**: Drawer lateral derecho (420px) con el carrito; overlay oscuro, bloqueo de scroll del body y CTA a `/checkout`. Se monta globalmente desde `StoreShell`.
- **Props**: ninguna. Lee `useUIStore` (`isCartOpen`, `closeCart`) y `useCartStore`.
- **Particularidades**: `z-[100]` overlay / `z-[110]` panel. Acá los botones **sí** son rectangulares (`rounded` no pill, `py-4`).

```jsx
// components/cart/CartDrawer.jsx
'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useUIStore } from '@/lib/store/uiStore'

export default function CartDrawer() {
  const router = useRouter()
  const { isCartOpen, closeCart } = useUIStore()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  // Bloquear el scroll del body cuando el carrito está abierto
  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isCartOpen])

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Panel del Carrito */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#FAF7F2] z-[110] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-[#EADFC8]">
          <h2 className="font-serif text-2xl text-[#2B0F0B] flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#C9A96E]" /> Tu pedido
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-[#9a8b7a] hover:text-[#2B0F0B] hover:bg-[#EADFC8] rounded-full transition"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-[#EADFC8] mb-4" />
              <p className="text-[#6b3a2c] font-medium">Tu carrito está vacío</p>
              <button onClick={closeCart} className="mt-4 text-[#C9A96E] hover:underline">
                Volver a la tienda
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-[#EADFC8]/50">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#EADFC8] shrink-0">
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-[#2B0F0B] leading-tight pr-2">{item.name}</h3>
                    <button onClick={() => removeItem(item.product_id)} className="text-[#9a8b7a] hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-[#9a8b7a] mt-1">${item.price.toLocaleString('es-AR')}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-[#EADFC8] rounded-lg">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 hover:bg-[#FAF7F2] text-[#2B0F0B] transition">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#2B0F0B]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 hover:bg-[#FAF7F2] text-[#2B0F0B] transition">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-[#2B0F0B]">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total y Botones) */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#EADFC8] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[#6b3a2c]">Total estimado</span>
              <span className="font-serif text-3xl text-[#2B0F0B]">${getTotal().toLocaleString('es-AR')}</span>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-[#2B0F0B] text-white py-4 font-medium hover:bg-[#5a1a10] transition shadow-lg"
              >
                Finalizar compra
              </button>
              <button
                onClick={closeCart}
                className="w-full py-3 text-sm font-medium text-[#6b3a2c] hover:text-[#2B0F0B] transition"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
```

---

## ClearCartOnMount

- **Archivo**: `components/ClearCartOnMount.jsx`
- **Descripción**: Componente sin render (`return null`) que vacía el carrito al montarse. Se usa en la página de éxito para limpiar después de confirmar el pedido.
- **Props**: ninguna.

```jsx
// components/ClearCartOnMount.jsx
'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/lib/store/cartStore'

export default function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart)
  useEffect(() => {
    clearCart()
  }, [clearCart])
  return null
}
```

---

## OrderStatusPanel

- **Archivo**: `components/admin/OrderStatusPanel.jsx`
- **Descripción**: Panel de acciones del pedido: botón de "siguiente paso lógico" según `FLOW`, botón de cancelar y grilla opcional con todos los estados.
- **Props**: `order` (`id`, `status`)
- **Particularidades**: define la constante local `glass` (una de las **tres** variantes de glass que existen en el repo) y actualiza Supabase directo desde el cliente.

```jsx
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
```

---

## PrintButton

- **Archivo**: `components/admin/PrintButton.jsx`
- **Descripción**: Botón pill translúcido que dispara `window.print()`. Depende de las reglas `@media print` de `app/globals.css`.
- **Props**: ninguna.

```jsx
// components/admin/PrintButton.jsx
'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-sm text-white hover:bg-white/20 transition"
    >
      <Printer size={16} /> Imprimir
    </button>
  )
}
```

---

## OrderNotifications

- **Archivo**: `components/admin/OrderNotifications.jsx`
- **Descripción**: Suscripción realtime a `orders` (INSERT): reproduce `/sounds/new-order.mp3`, muestra un toast de sonner con acción "Ver" y hace parpadear el título de la pestaña.
- **Props**: ninguna.

```jsx
// components/admin/OrderNotifications.jsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function OrderNotifications() {
  const router = useRouter()
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/new-order.mp3')
    audioRef.current.volume = 0.7

    const supabase = createClient()

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new

          if (['pending_payment', 'payment_review'].includes(order.status)) {
            // Reproducir sonido
            audioRef.current?.play().catch((err) => {
              console.warn('No se pudo reproducir el sonido:', err)
            })

            // Mostrar toast
            toast.success(`🔔 Nuevo pedido ${order.order_number}`, {
              description: `${order.customer_name} — $${Number(order.total).toLocaleString('es-AR')}`,
              duration: 8000,
              action: {
                label: 'Ver',
                onClick: () => router.push(`/admin/pedidos/${order.id}`),
              },
            })

            // Refrescar la página para que aparezca el pedido
            router.refresh()

            // Parpadear el título de la pestaña
            const originalTitle = document.title
            let blink = true
            const interval = setInterval(() => {
              document.title = blink ? '🔔 Nuevo pedido' : originalTitle
              blink = !blink
            }, 1000)

            // Parar después de 10 segundos
            setTimeout(() => {
              clearInterval(interval)
              document.title = originalTitle
            }, 10000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
```

---

## OrdersBoard

- **Archivo**: `components/admin/OrdersBoard.jsx`
- **Descripción**: Tablero de pedidos del admin. Define su propio `StatusBadge` + `getCardBorder`, tabs sincronizados con `?estado=`, buscador, toggle grid/lista persistido en `localStorage` y modal de cancelación.
- **Props**: `initialOrders` (array de pedidos con `order_items`)
- **Particularidades**: es el componente **más grande** del repo (405 líneas) y duplica el vocabulario visual de `OrdersTable` (ver *Legacy*). Sincroniza estado local optimista y escribe directo en Supabase.

```jsx
// components/admin/OrdersBoard.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Eye, ChefHat, CheckCircle, PackageCheck, X, 
  ChevronDown, ChevronUp, User, Phone, AlertTriangle,
  Search, LayoutGrid, List, Calendar, ArrowRight
} from 'lucide-react'

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  payment_review: 'Revisar pago',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const TABS = [
  { value: 'all', label: 'Todos', statuses: null },
  { value: 'new', label: 'Nuevos', statuses: ['pending_payment', 'payment_review'] },
  { value: 'preparing', label: 'En preparación', statuses: ['confirmed', 'preparing'] },
  { value: 'ready', label: 'Listos', statuses: ['ready'] },
  { value: 'history', label: 'Historial', statuses: ['delivered', 'cancelled'] },
]

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function formatDate(dateString) {
  const d = new Date(dateString)
  const day = d.getDate().toString().padStart(2, '0')
  const month = MONTHS[d.getMonth()]
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}-${month}, ${hours}:${minutes}`
}

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status
  if (status === 'pending_payment' || status === 'payment_review') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'confirmed' || status === 'preparing') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'ready') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        {label}
      </span>
    )
  }
  if (status === 'delivered') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-white/10 text-white/60 border border-white/10">
        {label}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-red-500/10 text-red-400 border border-red-500/30">
      {label}
    </span>
  )
}

function getCardBorder(status) {
  switch (status) {
    case 'pending_payment':
    case 'payment_review':
      return 'border-amber-500/40 hover:border-amber-400'
    case 'confirmed':
    case 'preparing':
      return 'border-emerald-500/40 hover:border-emerald-400'
    case 'ready':
      return 'border-cyan-500/40 hover:border-cyan-400'
    case 'delivered':
      return 'border-white/10 hover:border-white/30'
    case 'cancelled':
      return 'border-red-500/30 hover:border-red-400'
    default:
      return 'border-[#C9A96E]/20 hover:border-[#C9A96E]/50'
  }
}

export default function OrdersBoard({ initialOrders }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(initialOrders)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [cancelModal, setCancelModal] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)

  // Sincronizar tab con URL
  const estadoUrl = searchParams.get('estado') || 'all'
  const [tab, setTab] = useState(estadoUrl)

  useEffect(() => {
    const valid = TABS.some(t => t.value === estadoUrl)
    setTab(valid ? estadoUrl : 'all')
  }, [estadoUrl])

  // Al cambiar de pestaña, actualizamos la URL
  const handleTabChange = (newTab) => {
    setTab(newTab)
    const url = newTab === 'all' ? '/admin/pedidos' : `/admin/pedidos?estado=${newTab}`
    router.push(url, { scroll: false })
  }

  useEffect(() => {
    const savedView = localStorage.getItem('admin-orders-view')
    if (savedView) setView(savedView)
  }, [])

  const changeView = (newView) => {
    setView(newView)
    localStorage.setItem('admin-orders-view', newView)
  }

  const updateStatus = async (orderId, newStatus) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (error) {
      toast.error('Error al actualizar: ' + error.message)
      router.refresh()
    } else {
      toast.success('Pedido actualizado')
    }
  }

  const handleCancel = async () => {
    if (!cancelModal) return
    await updateStatus(cancelModal, 'cancelled')
    setCancelModal(null)
  }

  const filtered = useMemo(() => {
    const tabConfig = TABS.find(t => t.value === tab)
    let list = orders
    if (tabConfig?.statuses) list = list.filter(o => tabConfig.statuses.includes(o.status))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(o => 
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, tab, query])

  const renderActions = (order) => {
    if (['pending_payment', 'payment_review'].includes(order.status)) {
      return (
        <div className="flex gap-2">
          <Link href={`/admin/pedidos/${order.id}`} className="flex-1 flex items-center justify-center gap-1 bg-white/5 text-white/80 py-2 rounded-lg text-xs font-medium hover:bg-white/10 transition border border-white/10">
            <Eye size={13} /> Ver
          </Link>
          <button onClick={() => updateStatus(order.id, 'confirmed')} className="flex-1 flex items-center justify-center gap-1 bg-[#E0C89A] text-[#2b0f0b] py-2 rounded-lg text-xs font-bold hover:bg-white transition shadow-md">
            <ChefHat size={13} /> Preparar
          </button>
        </div>
      )
    }
    if (['confirmed', 'preparing'].includes(order.status)) {
      return (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setExpandedCard(expandedCard === order.id ? null : order.id)}
            className="w-full flex items-center justify-between text-xs text-[#C9A96E] hover:text-white transition bg-[#341D14] px-3 py-2 rounded-lg"
          >
            <span>Ver productos ({order.order_items?.length || 0})</span>
            {expandedCard === order.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {expandedCard === order.id && (
            <div className="bg-black/30 rounded-lg p-3 text-xs space-y-1.5 border border-white/5">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between text-white/80">
                  <span><span className="text-[#C9A96E] font-bold mr-1">{item.quantity}x</span> {item.product_name}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => updateStatus(order.id, 'ready')} className="w-full flex items-center justify-center gap-1 bg-emerald-500/20 text-emerald-200 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-black transition border border-emerald-500/30">
            <CheckCircle size={13} /> Marcar como listo
          </button>
        </div>
      )
    }
    if (order.status === 'ready') {
      return (
        <button onClick={() => updateStatus(order.id, 'delivered')} className="w-full flex items-center justify-center gap-1 bg-cyan-500/20 text-cyan-200 py-2 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-black transition border border-cyan-500/30">
          <PackageCheck size={13} /> Entregar pedido
        </button>
      )
    }
    return (
      <Link href={`/admin/pedidos/${order.id}`} className="w-full flex items-center justify-center gap-1 bg-white/5 text-white/50 py-2 rounded-lg text-xs font-medium hover:bg-white/10 transition">
        <Eye size={13} /> Ver detalle
      </Link>
    )
  }

  return (
    <div className="space-y-5 w-full">
      {/* Buscador y toggle de vista */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A96E]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por número, nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9A96E]/30 bg-[#1a0806] text-[#F5EDE3] placeholder:text-white/30 focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E] transition shadow-inner text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <div className="flex items-center bg-[#1a0806] rounded-lg border border-white/10 p-1">
            <button
              onClick={() => changeView('grid')}
              className={`p-1.5 rounded-md transition ${view === 'grid' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`}
              title="Vista de tarjetas"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => changeView('list')}
              className={`p-1.5 rounded-md transition ${view === 'list' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`}
              title="Vista de lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs mobile / desktop */}
      <div className="md:hidden">
        <select
          value={tab}
          onChange={(e) => handleTabChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-[#1a0806] text-white text-sm focus:border-[#C9A96E] focus:outline-none appearance-none"
        >
          {TABS.map((t) => {
            const count = t.statuses ? orders.filter((o) => t.statuses.includes(o.status)).length : orders.length
            return <option key={t.value} value={t.value}>{t.label} ({count})</option>
          })}
        </select>
      </div>

      <div className="hidden md:flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.statuses ? orders.filter((o) => t.statuses.includes(o.status)).length : orders.length
          const active = tab === t.value
          return (
            <button
              key={t.value}
              onClick={() => handleTabChange(t.value)}
              className={`px-3.5 py-1.5 text-xs rounded-full border transition flex items-center gap-2 ${
                active
                  ? 'bg-[#C9A96E] text-[#2b0f0b] border-[#C9A96E] font-bold shadow-md'
                  : 'bg-[#23120B] text-white/60 border-white/10 hover:bg-[#341D14] hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-black/20 text-black' : 'bg-white/10'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {filtered.length === 0 ? (
        <div className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-2xl p-12 text-center shadow-lg shadow-black/40">
          <p className="text-[#F5EDE3]/70 text-sm">
            {query ? 'No hay pedidos que coincidan con la búsqueda.' : 'No hay pedidos en esta categoría.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order, index) => (
            <div
              key={order.id || `order-${index}`}
              className={`relative flex flex-col bg-[#2A1810]/90 backdrop-blur-md border rounded-xl p-4 transition-all duration-300 shadow-lg shadow-black/40 ${getCardBorder(order.status)}`}
            >
              {!['delivered', 'cancelled'].includes(order.status) && (
                <button 
                  onClick={() => setCancelModal(order.id)}
                  className="absolute top-3 right-3 text-white/30 hover:text-red-400 transition z-10 p-1"
                  title="Cancelar pedido"
                >
                  <X size={14} />
                </button>
              )}

              <div className="mb-2 pr-6">
                <p className="font-mono text-sm text-[#F5EDE3] font-bold mb-1">{order.order_number}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#C9A96E]/80">
                  <Calendar size={11} className="text-[#C9A96E]" />
                  <span suppressHydrationWarning>{formatDate(order.created_at)}</span>
                </div>
              </div>

              <div className="mb-3">
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-[#F5EDE3] font-semibold text-base">
                  <User size={14} className="text-[#C9A96E]/70" />
                  {order.customer_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#C9A96E]/70">
                  <Phone size={12} className="text-[#C9A96E]/70" />
                  {order.customer_phone}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 mb-3 mt-auto">
                <p className="text-[9px] uppercase text-[#C9A96E]/60 mb-0.5 font-semibold tracking-wider">Total</p>
                <p className="font-serif text-xl text-[#F5EDE3] font-bold">${Number(order.total).toLocaleString('es-AR')}</p>
              </div>

              <div>{renderActions(order)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-xl overflow-hidden shadow-lg shadow-black/40 w-full max-w-full">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-[#1a0806] text-[#C9A96E]/70 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nro.</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, index) => (
                  <tr key={order.id || `order-list-${index}`} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono text-[#F5EDE3] font-bold">{order.order_number}</td>
                    <td className="px-4 py-3 text-[#F5EDE3]">{order.customer_name}</td>
                    <td className="px-4 py-3 text-[#C9A96E]/70" suppressHydrationWarning>{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 font-bold text-[#F5EDE3]">${Number(order.total).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/pedidos/${order.id}`} className="inline-flex items-center gap-1 text-[#C9A96E] hover:text-white transition">
                        Ver <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#2A1810] border border-red-500/30 p-6 rounded-xl max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={22} />
              <h3 className="font-serif text-lg text-white">¿Cancelar pedido?</h3>
            </div>
            <p className="text-white/70 text-xs mb-5">
              Esta acción moverá el pedido a la lista de cancelados. No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition text-xs">
                Volver
              </button>
              <button onClick={handleCancel} className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium text-xs">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## ProductsTable

- **Archivo**: `components/admin/ProductsTable.jsx`
- **Descripción**: Listado admin de productos con buscador, orden (A-Z / Z-A / precio), toggle grid/lista persistido y borrado con `window.confirm`.
- **Props**: `products` (array)
- **Particularidades**: su constante `glass` es **distinta** de la de `ProductForm`/`OrderStatusPanel`: usa `bg-[#2A1810]/80` en lugar de `bg-white/8`.

```jsx
// components/admin/ProductsTable.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, LayoutGrid, List, Pencil, Package, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const glass = 'border border-[#C9A96E]/20 bg-[#2A1810]/80 backdrop-blur-md shadow-lg shadow-black/40'

export default function ProductsTable({ products }) {
  const router = useRouter()
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const savedView = localStorage.getItem('admin-products-view')
    if (savedView) setView(savedView)
  }, [])

  const changeView = (newView) => {
    setView(newView)
    localStorage.setItem('admin-products-view', newView)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro que querés eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('Error al eliminar: ' + error.message)
    else { toast.success('Producto eliminado'); router.refresh() }
    setDeletingId(null)
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...products]
    if (query.trim()) result = result.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return Number(a.price) - Number(b.price)
        case 'price-desc': return Number(b.price) - Number(a.price)
        case 'name-desc': return b.name.localeCompare(a.name)
        default: return a.name.localeCompare(b.name)
      }
    })
    return result
  }, [products, query, sortBy])

  if (products.length === 0) {
    return (
      <div className={`${glass} rounded-2xl p-12 text-center`}>
        <Package className="mx-auto mb-3 text-white/40" size={32} />
        <p className="text-white/65 mb-4">Todavía no hay productos cargados.</p>
        <Link href="/admin/productos/nuevo" className="text-[#E0C89A] hover:text-white underline underline-offset-4">
          Crear el primer producto
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A96E]/70" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9A96E]/30 bg-[#1a0806] text-[#F5EDE3] placeholder:text-white/30 focus:border-[#C9A96E] focus:outline-none transition text-sm shadow-inner"
          />
        </div>

        {/* Filtros y Toggle de Vista */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full lg:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/20 bg-[#1a0806] text-white text-sm focus:border-[#C9A96E] focus:outline-none appearance-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="name-asc">A - Z</option>
            <option value="name-desc">Z - A</option>
            <option value="price-asc">Precio: Menor</option>
            <option value="price-desc">Precio: Mayor</option>
          </select>

          <div className="flex items-center bg-[#1a0806] rounded-xl border border-white/20 p-1 shrink-0">
            <button onClick={() => changeView('grid')} className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`} title="Tarjetas">
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => changeView('list')} className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`} title="Lista">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      {filteredAndSorted.length === 0 ? (
        <div className={`${glass} rounded-2xl p-12 text-center`}>
          <p className="text-white/65">No se encontraron productos con "{query}".</p>
        </div>
      ) : view === 'grid' ? (
        /* VISTA DE TARJETAS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full">
          {filteredAndSorted.map((p) => (
            <div key={p.id} className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-2xl overflow-hidden group hover:border-[#C9A96E]/50 transition-colors flex flex-col shadow-lg shadow-black/20">
              <div className="relative aspect-square bg-[#1a0806]">
                {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width: 768px) 100vw, 25vw" />}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_available ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-black/50 text-white/60 border-white/10'}`}>
                    {p.is_available ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] text-[#C9A96E] uppercase tracking-wider mb-1">{p.category}</span>
                <h3 className="text-[#F5EDE3] font-medium text-sm leading-tight mb-2 line-clamp-2">{p.name}</h3>
                <p className="text-[#F5EDE3] font-bold mt-auto mb-3">${Number(p.price).toLocaleString('es-AR')}</p>
                <div className="flex gap-2">
                  <Link href={`/admin/productos/${p.id}`} className="flex-1 text-center py-2 rounded-xl bg-white/5 text-white/80 hover:bg-[#C9A96E] hover:text-[#2b0f0b] transition text-xs font-semibold flex items-center justify-center gap-1 border border-white/10">
                    <Pencil size={12} /> Editar
                  </Link>
                  <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition disabled:opacity-50 border border-red-500/20">
                    {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE LISTA (TABLA) */
        <div className={`${glass} rounded-2xl w-full max-w-full overflow-hidden`}>
          {/* Este div es el que permite el scroll horizontal interno sin romper la página */}
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#1a0806] text-[#C9A96E]/70 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-4 font-medium w-16">Foto</th>
                  <th className="text-left px-4 py-4 font-medium">Nombre</th>
                  <th className="text-left px-4 py-4 font-medium">Categoría</th>
                  <th className="text-left px-4 py-4 font-medium">Precio</th>
                  <th className="text-center px-4 py-4 font-medium w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="40px" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#F5EDE3] font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-[#C9A96E]/70">{p.category}</td>
                    <td className="px-4 py-3 text-[#F5EDE3]">${Number(p.price).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/productos/${p.id}`} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-[#C9A96E] hover:text-[#2b0f0b] transition border border-white/10">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50 border border-red-500/20">
                          {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## ProductForm

- **Archivo**: `components/admin/ProductForm.jsx`
- **Descripción**: Formulario de alta/edición de producto (nombre, precio, categoría, descripción, disponibilidad) con subida de imagen a Supabase Storage (bucket `product-images` y preview con `FileReader`).
- **Props**: `initialData = null` — **la rama de edición nunca se ejecuta** hoy: el único uso es `<ProductForm />` en `/admin/productos/nuevo` sin props (ver `routes.md`).
- **Particularidades**: `CATEGORIES` está hardcodeado y repetido en otros 4 archivos (ver `theme.md`).

```jsx
// components/admin/ProductForm.jsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { productSchema } from '@/lib/validations/product'
import { toast } from 'sonner'

const CATEGORIES = ['Panes', 'Facturas', 'Dulces', 'Salados', 'Bocados calientes']

const glass =
  'relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]'

export default function ProductForm({ initialData = null }) {
  const router = useRouter()
  const isEditing = !!initialData
  const fileInputRef = useRef(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || '',
      category: initialData?.category || CATEGORIES[0],
      is_available: initialData?.is_available ?? true,
    },
  })

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      const supabase = createClient()
      let finalImageUrl = initialData?.image_url || null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        finalImageUrl = urlData.publicUrl
      }

      const productData = {
        ...data,
        image_url: finalImageUrl,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Producto actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])
        if (error) throw error
        toast.success('Producto creado correctamente')
      }

      router.push('/admin/productos')
      router.refresh()

    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        
        <div className={`${glass} rounded-2xl p-6 space-y-5`}>
          <h2 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Información del producto
          </h2>

          <div>
            <label className="block text-sm text-white/70 mb-1">Nombre</label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-[#E0C89A] focus:outline-none transition"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-[#E0C89A] focus:outline-none transition"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Categoría</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#150604] text-white focus:border-[#E0C89A] focus:outline-none appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Descripción</label>
            <textarea
              rows={4}
              {...register('description')}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-[#E0C89A] focus:outline-none transition resize-none"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isAvailable"
              {...register('is_available')}
              className="w-5 h-5 accent-[#E0C89A] cursor-pointer"
            />
            <label htmlFor="isAvailable" className="text-sm text-white/80 cursor-pointer">
              Producto visible y disponible en la tienda
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${glass} rounded-2xl p-6`}>
            <h2 className="font-serif text-lg text-white mb-4">Imagen</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
            >
              {imagePreview ? (
                <>
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <UploadCloud size={16} /> Cambiar foto
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon size={32} className="mx-auto text-white/30 mb-2" />
                  <p className="text-sm text-white/60">Click para subir foto</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#E0C89A] text-[#2b0f0b] py-3.5 rounded-full font-bold hover:bg-white transition disabled:opacity-50"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Guardar producto'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/productos')}
              disabled={loading}
              className="w-full py-3 rounded-full text-sm text-white/60 hover:text-white transition"
            >
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
```

---

## Legacy / no usar como referencia: `OrdersTable`

- **Archivo**: `components/admin/OrdersTable.jsx` (298 líneas)
- **Estado**: **huérfano** — ningún archivo lo importa. Fue reemplazado por `OrdersBoard`.
- **Por qué no se incluye completo**: duplica casi 1:1 el vocabulario de `OrdersBoard` (mismo `STATUS_LABELS`, mismo `TABS`, mismo `formatDate`, un `StatusBadge` casi idéntico y la misma tabla de 6 columnas). Único delta real: `getCardStyles()` agrega gradientes por estado y **no** tiene acciones rápidas ni modal de cancelación, y sus tabs no están sincronizadas con la URL.
- **Si alguna vez se usa como contexto de diseño**: leer el archivo del repo directamente; no aporta patrones nuevos.

Diferencias verificadas entre ambos:

| Aspecto | `OrdersBoard` (vivo) | `OrdersTable` (huérfano) |
|---|---|---|
| Tabs ↔ URL (`?estado=`) | sí | no (estado local) |
| Acciones inline (Preparar/Listo/Entregar) | sí | no |
| Modal de cancelación | sí | no |
| Expandir productos del pedido | sí | no |
| Estilo de tarjeta de pedido | borde por estado | gradiente + glow por estado |
| Tamaño de badge | `text-[9px]`, `px-2.5` | `text-[10px]`, `px-3` |
