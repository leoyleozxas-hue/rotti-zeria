// components/ProductCard.jsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useEffect, useRef, useState } from 'react'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleFav = useFavoritesStore((s) => s.toggle)
  const isFavorite = useFavoritesStore((s) => (product ? s.isFavorite(product.id) : false))
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef(null)

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

  function handleMouseMove(e) {
    if (!cardRef.current) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(hover: none)').matches) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  function handleMouseLeave() {
    if (!cardRef.current) return
    cardRef.current.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)'
  }

  const heartClass =
    mounted && isFavorite
      ? 'fill-red-500 text-red-500'
      : 'text-gray-400 group-hover:text-red-400'

  const shortDescription = (product.description || '').split('\n')[0].trim()

  return (
    <Link
      ref={cardRef}
      href={`/productos/${product.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card group relative flex flex-col h-full bg-[#FCFAF8] overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-[#EADFC8] hover:border-[#C9A96E]"
    >
      {product.is_featured && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-[#C9A96E] text-[#2b0f0b] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 shadow-md">
          Destacado
        </div>
      )}

      <button
        onClick={handleFavorite}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition"
        aria-label="Favorito"
      >
        <Heart size={16} className={`transition ${heartClass}`} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-gray-100 shrink-0">
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

      <div className="p-3 sm:p-5 flex flex-col flex-1 min-h-0">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#9a8b7a] mb-1 font-semibold shrink-0">
          {product.category}
        </span>

        <h3 className="font-serif text-sm sm:text-lg text-[#2B0F0B] mb-1 sm:mb-2 leading-tight group-hover:text-[#5a1a10] transition font-semibold line-clamp-2 shrink-0">
          {product.name}
        </h3>

        <p className="hidden sm:block text-sm text-gray-500 mb-4 line-clamp-2">
          {shortDescription}
        </p>

        <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-serif text-base sm:text-xl text-[#2B0F0B] font-bold">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1 bg-[#2B0F0B] text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-[#5a1a10] transition active:scale-95 shadow-md w-full sm:w-auto"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
      </div>
    </Link>
  )
}