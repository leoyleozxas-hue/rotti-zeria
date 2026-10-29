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
      className="group relative flex flex-col bg-[#FCFAF8] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-[#EADFC8] hover:border-[#C9A96E]"
    >
      {product.category === 'Facturas' && (
        <div className="absolute top-4 left-4 z-10 bg-[#C9A96E] text-[#2b0f0b] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
          Más vendido
        </div>
      )}

      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition"
        aria-label="Favorito"
      >
        <Heart size={18} className={`transition ${heartClass}`} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="eager"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

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
            onClick={handleAddToCart}
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