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
    <div className="space-y-4">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-caramel">Cantidad:</span>
        <div className="flex items-center gap-2 bg-white border border-beige rounded-full p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 rounded-full hover:bg-beige flex items-center justify-center transition"
            aria-label="Restar"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 rounded-full hover:bg-beige flex items-center justify-center transition"
            aria-label="Sumar"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 bg-chocolate text-cream py-4 rounded-full hover:bg-caramel transition active:scale-[0.98]"
        >
          <ShoppingBag size={18} />
          Agregar al carrito
        </button>

        <button
          onClick={() => toggleFav(product)}
          className="w-14 h-14 rounded-full border border-beige bg-white hover:border-red-300 flex items-center justify-center transition"
          aria-label="Favorito"
        >
          <Heart
            size={20}
            className={`transition ${
              mounted && isFavorite ? 'fill-red-500 text-red-500' : 'text-caramel/60'
            }`}
          />
        </button>
      </div>
    </div>
  )
}