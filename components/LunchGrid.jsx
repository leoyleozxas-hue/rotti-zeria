// components/LunchGrid.jsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, X, ArrowUpRight, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/store/cartStore'

export default function LunchGrid({ lunches }) {
  const [selected, setSelected] = useState(null)
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  // Bloquear scroll
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selected])

  // Animación de entrada
  useEffect(() => {
    if (selected && !closing) {
      const t = setTimeout(() => setMounted(true), 10)
      return () => clearTimeout(t)
    }
  }, [selected, closing])

  // ESC para cerrar
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function handleClose() {
    setClosing(true)
    setMounted(false)
    setTimeout(() => {
      setSelected(null)
      setClosing(false)
    }, 250)
  }

  function handleAddToCart(combo) {
    addItem({
      id: combo.id,
      name: combo.name,
      price: Number(combo.price),
      image_url: combo.image_url,
    })
    toast.success(`${combo.name} agregado al carrito`, {
      description: 'Revisá tu pedido en el carrito',
    })
    handleClose()
  }

  return (
    <>
      {/* Grid de cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {lunches.map((combo, i) => (
          <button
            key={combo.id}
            type="button"
            onClick={() => setSelected(combo)}
            style={{ animationDelay: `${i * 80}ms` }}
            className="anim-rise group text-left border border-[#EADFC8] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#C9A96E] transition-all duration-300 flex flex-col"
          >
            {combo.image_url && (
              <div className="relative h-48 w-full bg-[#EADFC8] overflow-hidden">
                <Image
                  src={combo.image_url}
                  alt={combo.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#2B0F0B] opacity-0 group-hover:opacity-100 transition shadow-md">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-serif text-xl text-[#2B0F0B] mb-2 group-hover:text-[#5a1a10] transition">
                {combo.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
                {combo.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                <p className="text-lg font-bold text-[#2B0F0B]">
                  ${Number(combo.price).toLocaleString('es-AR')}
                </p>
                <span className="text-xs text-[#C9A96E] group-hover:text-[#2B0F0B] transition flex items-center gap-1 font-semibold">
                  Ver detalle
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-250 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay con tinte cálido */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#2B0F0B]/90 via-black/80 to-[#C9A96E]/30 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Panel */}
          <div
            className={`relative bg-[#FAF7F2] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.7)] transition-all duration-250 ${
              mounted ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            }`}
            style={{
              borderTop: '3px solid #C9A96E',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal con degradé cálido */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#2B0F0B] via-[#3a130d] to-[#2B0F0B] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#E0C89A]" />
                <span className="text-[#E0C89A] text-[10px] uppercase tracking-[0.3em] font-bold">
                  Lunch · Combo
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Imagen */}
            {selected.image_url && (
              <div className="relative w-full h-56 sm:h-64 bg-[#EADFC8]">
                <Image
                  src={selected.image_url}
                  alt={selected.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
            )}

            {/* Contenido */}
            <div className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#2B0F0B] mb-4">
                {selected.name}
              </h2>

              <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed mb-6">
                {selected.description}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t-2 border-[#C9A96E]/30">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#9a8b7a] mb-1 font-semibold">
                    Precio
                  </p>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-[#2B0F0B]">
                    ${Number(selected.price).toLocaleString('es-AR')}
                  </p>
                </div>
                <button
                  onClick={() => handleAddToCart(selected)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2B0F0B] to-[#5a1a10] text-white px-6 py-3.5 text-sm font-semibold hover:from-[#5a1a10] hover:to-[#2B0F0B] transition shadow-lg active:scale-95"
                >
                  <Plus size={16} />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}