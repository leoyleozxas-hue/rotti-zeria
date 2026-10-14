// app/carrito/page.jsx
'use client'

import { useCartStore } from '@/lib/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-4xl text-chocolate mb-4">Tu carrito está vacío</h1>
        <p className="text-caramel mb-8">Agregá productos para empezar tu pedido.</p>
        <Link
          href="/productos"
          className="inline-block bg-chocolate text-cream px-8 py-3 rounded-full hover:bg-caramel transition"
        >
          Ver productos
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl text-chocolate mb-8">Tu pedido</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-beige flex-shrink-0">
              {item.image_url && (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-serif text-lg text-chocolate">{item.name}</h3>
              <p className="text-sm text-caramel">
                ${item.price.toLocaleString('es-AR')} c/u
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-beige hover:bg-gold-soft flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-beige hover:bg-gold-soft flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="text-right">
              <p className="font-serif text-lg text-chocolate">
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </p>
              <button
                onClick={() => removeItem(item.product_id)}
                className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
              >
                <Trash2 size={12} /> Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg text-caramel">Total</span>
          <span className="font-serif text-3xl text-chocolate">
            ${getTotal().toLocaleString('es-AR')}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearCart}
            className="px-4 py-3 rounded-full border border-beige text-caramel hover:bg-beige transition text-sm"
          >
            Vaciar
          </button>
          <Link
            href="/checkout"
            className="flex-1 bg-chocolate text-cream text-center py-3 rounded-full hover:bg-caramel transition"
          >
            Continuar con el pedido
          </Link>
        </div>
      </div>
    </main>
  )
}