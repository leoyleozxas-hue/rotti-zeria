// app/favoritos/page.jsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useCartStore } from '@/lib/store/cartStore'

export default function FavoritosPage() {
  const { items, remove, clear } = useFavoritesStore()
  const addItem = useCartStore((s) => s.addItem)

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-caramel/30 mb-4" />
        <h1 className="font-serif text-3xl text-chocolate mb-4">
          Todavía no tenés favoritos
        </h1>
        <p className="text-caramel mb-8">
          Tocá el corazón en los productos para guardarlos acá.
        </p>
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl text-chocolate">Tus favoritos</h1>
        <button
          onClick={clear}
          className="text-sm text-caramel hover:text-red-500 transition"
        >
          Vaciar todo
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
          >
            <Link
              href={`/productos/${item.product_id}`}
              className="relative w-20 h-20 rounded-xl overflow-hidden bg-beige flex-shrink-0"
            >
              {item.image_url && (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <span className="text-xs uppercase tracking-wider text-gold">
                {item.category}
              </span>
              <Link href={`/productos/${item.product_id}`}>
                <h3 className="font-serif text-lg text-chocolate hover:text-caramel transition truncate">
                  {item.name}
                </h3>
              </Link>
              <p className="text-sm text-caramel">
                ${item.price.toLocaleString('es-AR')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addItem({ id: item.product_id, ...item })}
                className="flex items-center gap-1 bg-chocolate text-cream px-4 py-2 rounded-full text-sm hover:bg-caramel transition"
              >
                <ShoppingBag size={14} />
                Agregar
              </button>
              <button
                onClick={() => remove(item.product_id)}
                className="w-9 h-9 rounded-full bg-beige hover:bg-red-100 flex items-center justify-center text-caramel hover:text-red-500 transition"
                aria-label="Quitar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}