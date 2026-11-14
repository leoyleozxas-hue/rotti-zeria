// components/ClearCartOnMount.jsx
'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'

export default function ClearCartOnMount() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const clearCart = useCartStore((s) => s.clearCart)
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return
    if (!orderNumber) return
    if (typeof window === 'undefined') return

    const key = `cart-cleared-${orderNumber}`

    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage bloqueado: proceder igual, pero con guard en ref
    }

    doneRef.current = true
    clearCart()
  }, [orderNumber, clearCart])

  return null
}