// app/favoritos/page.jsx
'use client'

import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import ProductCard from '@/components/ProductCard'

export default function FavoritosPage() {
  const { items, clear } = useFavoritesStore()

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-[#EADFC8]/30 rounded-full flex items-center justify-center mb-6">
          <Heart size={40} className="text-[#C9A96E]" />
        </div>
        <h1 className="font-serif text-4xl text-[#2B0F0B] mb-4">
          Todavía no tenés favoritos
        </h1>
        <p className="text-[#6b3a2c] max-w-md mb-8">
          Tocá el corazón en los productos que más te gusten para guardarlos acá y tenerlos siempre a mano.
        </p>
        <Link
          href="/productos"
          className="bg-[#2B0F0B] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#5a1a10] transition shadow-lg"
        >
          Explorar productos
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] font-bold block mb-2">
            Guardados
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-[#2B0F0B]">
            Tus favoritos
          </h1>
        </div>
        <button
          onClick={clear}
          className="flex items-center gap-2 text-sm text-[#6b3a2c] hover:text-red-600 transition-colors bg-white/50 px-4 py-2 rounded-full border border-[#EADFC8] shadow-sm"
        >
          <Trash2 size={16} />
          Vaciar lista
        </button>
      </div>

      {/* Grilla de tarjetas con animación */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => {
          // Adaptamos el item guardado en Zustand al formato que espera ProductCard
          const productForCard = {
            id: item.product_id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            category: item.category,
            description: item.description,
          }

          return (
            <div
              key={item.product_id}
              className="anim-rise"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ProductCard product={productForCard} />
            </div>
          )
        })}
      </div>
    </main>
  )
}