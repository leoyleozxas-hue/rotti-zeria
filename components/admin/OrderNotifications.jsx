// components/admin/OrderNotifications.jsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function OrderNotifications() {
  const router = useRouter()
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/new-order.mp3')
    audioRef.current.volume = 0.7

    const supabase = createClient()

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new

          if (['pending_payment', 'payment_review'].includes(order.status)) {
            // Reproducir sonido
            audioRef.current?.play().catch((err) => {
              console.warn('No se pudo reproducir el sonido:', err)
            })

            // Mostrar toast
            toast.success(`🔔 Nuevo pedido ${order.order_number}`, {
              description: `${order.customer_name} — $${Number(order.total).toLocaleString('es-AR')}`,
              duration: 8000,
              action: {
                label: 'Ver',
                onClick: () => router.push(`/admin/pedidos/${order.id}`),
              },
            })

            // Refrescar la página para que aparezca el pedido
            router.refresh()

            // Parpadear el título de la pestaña
            const originalTitle = document.title
            let blink = true
            const interval = setInterval(() => {
              document.title = blink ? '🔔 Nuevo pedido' : originalTitle
              blink = !blink
            }, 1000)

            // Parar después de 10 segundos
            setTimeout(() => {
              clearInterval(interval)
              document.title = originalTitle
            }, 10000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}