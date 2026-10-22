// components/cart/CartDrawer.jsx
'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useUIStore } from '@/lib/store/uiStore'

export default function CartDrawer() {
  const router = useRouter()
  const { isCartOpen, closeCart } = useUIStore()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  // Bloquear el scroll del body cuando el carrito está abierto
  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isCartOpen])

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Panel del Carrito */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#FAF7F2] z-[110] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-[#EADFC8]">
          <h2 className="font-serif text-2xl text-[#2B0F0B] flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#C9A96E]" /> Tu pedido
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-[#9a8b7a] hover:text-[#2B0F0B] hover:bg-[#EADFC8] rounded-full transition"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-[#EADFC8] mb-4" />
              <p className="text-[#6b3a2c] font-medium">Tu carrito está vacío</p>
              <button onClick={closeCart} className="mt-4 text-[#C9A96E] hover:underline">
                Volver a la tienda
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-[#EADFC8]/50">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#EADFC8] shrink-0">
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-[#2B0F0B] leading-tight pr-2">{item.name}</h3>
                    <button onClick={() => removeItem(item.product_id)} className="text-[#9a8b7a] hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-[#9a8b7a] mt-1">${item.price.toLocaleString('es-AR')}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-[#EADFC8] rounded-lg">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 hover:bg-[#FAF7F2] text-[#2B0F0B] transition">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#2B0F0B]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 hover:bg-[#FAF7F2] text-[#2B0F0B] transition">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-[#2B0F0B]">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total y Botones) */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#EADFC8] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[#6b3a2c]">Total estimado</span>
              <span className="font-serif text-3xl text-[#2B0F0B]">${getTotal().toLocaleString('es-AR')}</span>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-[#2B0F0B] text-white py-4 font-medium hover:bg-[#5a1a10] transition shadow-lg"
              >
                Finalizar compra
              </button>
              <button
                onClick={closeCart}
                className="w-full py-3 text-sm font-medium text-[#6b3a2c] hover:text-[#2B0F0B] transition"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}