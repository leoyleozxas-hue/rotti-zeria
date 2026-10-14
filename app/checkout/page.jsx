// app/checkout/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Loader2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { orderSchema } from '@/lib/validations/order'

function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal } = useCartStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { delivery_type: 'pickup' },
  })

  const deliveryType = watch('delivery_type')
  const total = getTotal()

  // Loader a pantalla completa mientras envía
  if (submitting) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Loader2 size={48} className="animate-spin text-gold mb-4" />
        <h1 className="font-serif text-2xl text-chocolate mb-2">
          Enviando tu pedido...
        </h1>
        <p className="text-caramel text-sm">No cierres esta ventana</p>
      </main>
    )
  }

  // Carrito vacío (solo si NO está enviando)
  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-caramel/30 mb-4" />
        <h1 className="font-serif text-3xl text-chocolate mb-4">
          Tu carrito está vacío
        </h1>
        <button
          onClick={() => router.push('/productos')}
          className="bg-chocolate text-cream px-6 py-3 rounded-full hover:bg-caramel transition"
        >
          Ver productos
        </button>
      </main>
    )
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: data, items }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      router.push(`/checkout/exito?order=${result.order.order_number}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl md:text-5xl text-chocolate mb-10">
        Finalizar pedido
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid lg:grid-cols-[1fr_400px] gap-8"
      >
        {/* ---------- Columna izquierda ---------- */}
        <div className="space-y-6">
          {/* Datos personales */}
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-xl text-chocolate">Tus datos</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-caramel mb-1">Nombre</label>
                <input
                  {...register('first_name')}
                  className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-caramel mb-1">Apellido</label>
                <input
                  {...register('last_name')}
                  className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-caramel mb-1">DNI</label>
                <input
                  {...register('dni')}
                  className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                  placeholder="12345678"
                />
                {errors.dni && (
                  <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-caramel mb-1">Teléfono</label>
                <input
                  {...register('customer_phone')}
                  className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                  placeholder="11 1234-5678"
                />
                {errors.customer_phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customer_phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-caramel mb-1">
                Email (opcional)
              </label>
              <input
                {...register('customer_email')}
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
              />
              {errors.customer_email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.customer_email.message}
                </p>
              )}
            </div>
          </section>

          {/* Entrega */}
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-xl text-chocolate">Entrega</h2>

            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="pickup"
                  {...register('delivery_type')}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-xl border border-beige peer-checked:border-gold peer-checked:bg-gold/10 text-center transition">
                  Retiro en local
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="delivery"
                  {...register('delivery_type')}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-xl border border-beige peer-checked:border-gold peer-checked:bg-gold/10 text-center transition">
                  Envío a domicilio
                </div>
              </label>
            </div>

            {deliveryType === 'delivery' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-caramel mb-1">Calle</label>
                    <input
                      {...register('street')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                    {errors.street && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.street.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-caramel mb-1">Número</label>
                    <input
                      {...register('street_number')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-caramel mb-1">
                      Piso (opcional)
                    </label>
                    <input
                      {...register('floor')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-caramel mb-1">
                      Depto (opcional)
                    </label>
                    <input
                      {...register('apartment')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-caramel mb-1">Barrio</label>
                    <input
                      {...register('neighborhood')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-caramel mb-1">Ciudad</label>
                    <input
                      {...register('city')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-caramel mb-1">C.P.</label>
                    <input
                      {...register('postal_code')}
                      className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Fecha */}
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-xl text-chocolate">
              ¿Para cuándo lo querés?
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-caramel mb-1">Fecha</label>
                <input
                  type="date"
                  {...register('pickup_date')}
                  min={getMinDate()}
                  className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                />
                {errors.pickup_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pickup_date.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-caramel mb-1">
                  Horario aproximado (opcional)
                </label>
                <input
                  type="time"
                  {...register('pickup_time')}
                  className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                />
              </div>
            </div>

            <p className="text-xs text-caramel/70">
              Mínimo 24hs de anticipación. No trabajamos los domingos.
            </p>
          </section>

          {/* Pago */}
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="font-serif text-xl text-chocolate">Pago</h2>
            <p className="text-sm text-caramel">
              Al confirmar, te mostramos los datos bancarios para la transferencia.
            </p>
            <div>
              <label className="block text-sm text-caramel mb-1">
                Nro. de comprobante (opcional)
              </label>
              <input
                {...register('payment_reference')}
                className="w-full px-4 py-2.5 rounded-xl border border-beige focus:border-gold focus:outline-none transition"
                placeholder="Ej: 00123456"
              />
            </div>
          </section>
        </div>

        {/* ---------- Columna derecha: resumen sticky ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-xl text-chocolate mb-4">Tu pedido</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chocolate truncate">{item.name}</p>
                    <p className="text-xs text-caramel">
                      {item.quantity} × ${item.price.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-chocolate">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-beige pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-caramel">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-sm text-caramel">
                <span>
                  {deliveryType === 'delivery' ? 'Envío' : 'Retiro en local'}
                </span>
                <span>
                  {deliveryType === 'delivery' ? 'A coordinar' : 'Gratis'}
                </span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-beige mt-3">
                <span className="text-chocolate font-semibold">Total</span>
                <span className="font-serif text-2xl text-chocolate">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-chocolate text-cream py-4 rounded-full hover:bg-caramel transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando pedido...
                </>
              ) : (
                'Confirmar pedido'
              )}
            </button>

            <p className="text-xs text-caramel/70 text-center mt-3">
              Al confirmar aceptás nuestros términos y condiciones.
            </p>
          </div>
        </aside>
      </form>
    </main>
  )
}