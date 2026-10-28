// components/AddToCartSection.jsx
'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import useHydrated from '@/lib/hooks/useHydrated'

export default function AddToCartSection({ product }) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))

  const [quantity, setQuantity] = useState(1)
  const mounted = useHydrated()

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