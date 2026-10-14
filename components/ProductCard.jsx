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
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFav(product)
  }

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
    >
      {/* Corazón */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition shadow-sm"
        aria-label="Favorito"
      >
        <Heart
          size={18}
          className={`transition ${
            mounted && isFavorite
              ? 'fill-red-500 text-red-500'
              : 'text-caramel/60 group-hover:text-red-400'
          }`}
        />
      </button>

      <div className="relative aspect-square overflow-hidden bg-beige">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-caramel/40">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs uppercase tracking-wider text-gold mb-1">
          {product.category}
        </span>
        <h3 className="font-serif text-lg text-chocolate mb-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-sm text-caramel/80 mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-xl text-chocolate">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addItem(product)
            }}
            className="flex items-center gap-1 bg-chocolate text-cream px-4 py-2 rounded-full text-sm hover:bg-caramel transition active:scale-95"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>
    </Link>
  )
}