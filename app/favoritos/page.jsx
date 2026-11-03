// app/favoritos/page.jsx
'use client'

import Link from 'next/link'
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { useCartStore } from '@/lib/store/cartStore'
import ProductCard from '@/components/ProductCard'

export default function FavoritosPage() {
  const { items, clear } = useFavoritesStore()
  const addItem = useCartStore((s) => s.addItem)

  function handleAddAllToCart() {
    items.forEach((item) => {
      addItem({
        id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
      })
    })
    toast.success(`${items.length} ${items.length === 1 ? 'producto agregado' : 'productos agregados'} al carrito`, {
      description: 'Revisá tu pedido en el carrito',
    })
  }

  // ─── Empty state ───
  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#FAF7F2]">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-[#EADFC8]/60 rounded-full flex items-center justify-center">
            <Heart size={40} className="text-[#C9A96E]" />
          </div>
          <Heart
            size={16}
            className="absolute -top-1 -right-1 text-[#C9A96E]/50"
            fill="currentColor"
          />
          <Heart
            size={12}
            className="absolute -bottom-1 -left-2 text-[#C9A96E]/30"
            fill="currentColor"
          />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-[#2B0F0B] mb-3">
          Todavía no tenés favoritos
        </h1>
        <p className="text-[#6b3a2c] max-w-md mb-8 text-sm md:text-base">
          Tocá el corazón de los productos que más te gusten y los vas a encontrar acá para tenerlos siempre a mano.
        </p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-[#2B0F0B] text-white px-7 py-3.5 rounded-full font-medium hover:bg-[#5a1a10] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 shadow-lg"
        >
          Explorar productos
          <ArrowRight size={16} />
        </Link>
      </main>
    )
  }

  // ─── Con favoritos ───
  return (
    <main className="max-w-7xl mx-auto px-4 pt-10 pb-16 min-h-[70vh] bg-[#FAF7F2]">
      {/* Header con contador y acciones */}
      <div className="flex flex-col gap-5 mb-8 pb-5 border-b border-[#EADFC8]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-[#C9A96E] text-[10px] uppercase tracking-[0.3em] font-bold block mb-1.5">
              Guardados
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#2B0F0B] flex items-baseline gap-3">
              Tus favoritos
              <span className="font-sans text-base md:text-lg font-normal text-[#9a8b7a]">
                ({items.length})
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleAddAllToCart}
              className="inline-flex items-center gap-2 bg-[#2B0F0B] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#5a1a10] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 shadow-md"
            >
              <ShoppingBag size={15} />
              Agregar todo
            </button>
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-sm text-[#9a8b7a] hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
              Vaciar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {items.map((item, index) => {
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
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <ProductCard product={productForCard} />
            </div>
          )
        })}
      </div>

      {/* Footer discreto */}
      <div className="mt-10 pt-6 border-t border-[#EADFC8] text-center">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-sm text-[#6b3a2c] hover:text-[#C9A96E] transition font-medium group"
        >
          Seguir explorando el catálogo
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </main>
  )
}