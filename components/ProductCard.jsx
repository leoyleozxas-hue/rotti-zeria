// components/ProductCard.jsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useEffect, useState } from 'react'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const isFavorite = useFavoritesStore((s) => (product ? s.isFavorite(product.id) : false))
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

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} agregado al carrito`, {
      description: 'Revisá tu pedido en el carrito',
    })
  }

  const heartClass =
    mounted && isFavorite
      ? 'fill-red-500 text-red-500'
      : 'text-gray-400 group-hover:text-red-400'

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group relative flex flex-col bg-[#FCFAF8] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-[#EADFC8] hover:border-[#C9A96E]"
    >
      {product.category === 'Facturas' && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#C9A96E] text-[#2b0f0b] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
          Más vendido
        </div>
      )}

      <button
        onClick={handleFavorite}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition"
        aria-label="Favorito"
      >
        <Heart size={16} className={`transition ${heartClass}`} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#9a8b7a] mb-1 font-semibold">
          {product.category}
        </span>
        <h3 className="font-serif text-sm sm:text-lg text-[#2B0F0B] mb-1 sm:mb-2 leading-tight group-hover:text-[#5a1a10] transition font-semibold line-clamp-2">
          {product.name}
        </h3>
        <p className="hidden sm:block text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Precio + Botón */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-serif text-base sm:text-xl text-[#2B0F0B] font-bold">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1 bg-[#2B0F0B] text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-[#5a1a10] transition active:scale-95 shadow-md w-full sm:w-auto"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
      </div>
    </Link>
  )
}