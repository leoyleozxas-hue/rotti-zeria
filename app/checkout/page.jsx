// app/checkout/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, Copy, Check, MessageCircle, MapPin, Calendar, CreditCard } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { orderSchema } from '@/lib/validations/order'
import { toast } from 'sonner'

function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const STEPS = ['Datos', 'Envío', 'Confirmar']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { delivery_type: 'pickup' },
    mode: 'onTouched',
  })

  const deliveryType = watch('delivery_type')
  const total = getTotal()

  async function handleNext() {
    let fieldsToValidate = []
    if (step === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'dni', 'customer_phone', 'birthdate']
    } else if (step === 2) {
      fieldsToValidate = ['pickup_date']
      if (deliveryType === 'delivery') {
        fieldsToValidate.push('street', 'street_number', 'neighborhood', 'city')
      }
    }
    const isValid = await trigger(fieldsToValidate)
    if (isValid) setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: data, items }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      setOrderResult(result.order)
      clearCart()
      setStep(4)
    } catch (err) {
      toast.error('Error al procesar el pedido', { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  // Botón "Confirmar Pedido" — SOLO aquí se envía
  const handleConfirm = () => {
    if (submitting) return
    handleSubmit(onSubmit)()
  }

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName === 'alias' ? 'Alias' : 'CBU'} copiado`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (items.length === 0 && step !== 4) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-[#2B0F0B] mb-4">Tu carrito está vacío</h1>
        <Link
          href="/productos"
          className="bg-[#2B0F0B] text-white px-6 py-3 rounded-full hover:bg-[#5a1a10] transition"
        >
          Ver productos
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 -mt-[4.25rem] pt-[6rem] min-h-screen bg-[#FAF7F2]">

      {/* ── ÉXITO ── */}
      {step === 4 && orderResult && (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-[#EADFC8] text-center anim-rise">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="font-serif text-4xl text-[#2B0F0B] mb-2">¡Pedido confirmado!</h1>
          <p className="text-[#6b3a2c] mb-6">
            Tu número de pedido es{' '}
            <strong className="text-[#2B0F0B] text-lg font-mono">{orderResult.order_number}</strong>
          </p>

          <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#EADFC8] text-left mb-8">
            <h3 className="font-serif text-lg text-[#2B0F0B] mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-[#C9A96E]" /> Datos para transferir
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-[#EADFC8] pb-2">
                <span className="text-[#9a8b7a]">Banco</span>
                <span className="font-medium text-[#2B0F0B]">Banco Ejemplo</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EADFC8] pb-2">
                <span className="text-[#9a8b7a]">Titular</span>
                <span className="font-medium text-[#2B0F0B]">Panadería Biarritz</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EADFC8] pb-2">
                <span className="text-[#9a8b7a]">Alias</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#2B0F0B]">BIARRITZ.PAN</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('BIARRITZ.PAN', 'alias')}
                    className="p-1.5 bg-white border border-[#EADFC8] rounded-md hover:bg-[#EADFC8] transition text-[#C9A96E]"
                    aria-label="Copiar alias"
                  >
                    {copiedField === 'alias' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9a8b7a]">CBU</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#2B0F0B] font-mono text-xs">0000003100000000000000</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('0000003100000000000000', 'cbu')}
                    className="p-1.5 bg-white border border-[#EADFC8] rounded-md hover:bg-[#EADFC8] transition text-[#C9A96E]"
                    aria-label="Copiar CBU"
                  >
                    {copiedField === 'cbu' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`https://wa.me/5491112345678?text=Hola!%20Acabo%20de%20hacer%20el%20pedido%20%23${orderResult.order_number}%20y%20quiero%20enviar%20el%20comprobante%20de%20transferencia.`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-[#1eb356] transition shadow-lg"
            >
              <MessageCircle size={20} /> Enviar comprobante por WhatsApp
            </a>
            <Link
              href="/"
              className="block w-full py-3 text-sm text-[#6b3a2c] hover:text-[#2B0F0B] transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      )}

      {/* ── FORMULARIO ── */}
      {step < 4 && (
        <>
          {/* Progreso */}
          <div className="flex items-center justify-center mb-10">
            {STEPS.map((label, i) => {
              const num = i + 1
              const active = step === num
              const completed = step > num
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        active
                          ? 'bg-[#2B0F0B] text-white'
                          : completed
                          ? 'bg-[#C9A96E] text-white'
                          : 'bg-[#EADFC8] text-[#9a8b7a]'
                      }`}
                    >
                      {completed ? <Check size={16} /> : num}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        active ? 'text-[#2B0F0B]' : 'text-[#9a8b7a]'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-16 md:w-24 h-0.5 mx-2 mb-6 ${
                        step > num ? 'bg-[#C9A96E]' : 'bg-[#EADFC8]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Form blindado: Enter no hace nada */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-[#EADFC8]"
          >
            {/* PASO 1 */}
            {step === 1 && (
              <div className="space-y-5 anim-rise">
                <h2 className="font-serif text-2xl text-[#2B0F0B] mb-6">Tus datos</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Nombre</label>
                    <input
                      {...register('first_name')}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Apellido</label>
                    <input
                      {...register('last_name')}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Documento (DNI)</label>
                    <input
                      {...register('dni')}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                    {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Teléfono</label>
                    <input
                      {...register('customer_phone')}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                    {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Fecha de nacimiento</label>
                    <input
                      type="date"
                      {...register('birthdate')}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                    {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Email (opcional)</label>
                    <input
                      type="email"
                      {...register('customer_email')}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <div className="space-y-5 anim-rise">
                <h2 className="font-serif text-2xl text-[#2B0F0B] mb-6">Entrega</h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <label className="cursor-pointer">
                    <input type="radio" value="pickup" {...register('delivery_type')} className="peer sr-only" />
                    <div className="p-4 rounded-xl border border-[#EADFC8] bg-[#FAF7F2] peer-checked:border-[#2B0F0B] peer-checked:bg-[#2B0F0B] peer-checked:text-white text-center transition">
                      Retiro en local
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" value="delivery" {...register('delivery_type')} className="peer sr-only" />
                    <div className="p-4 rounded-xl border border-[#EADFC8] bg-[#FAF7F2] peer-checked:border-[#2B0F0B] peer-checked:bg-[#2B0F0B] peer-checked:text-white text-center transition">
                      Envío a domicilio
                    </div>
                  </label>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="space-y-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EADFC8]">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-[#6b3a2c] mb-1">Calle</label>
                        <input {...register('street')} className="w-full rounded-lg border border-[#EADFC8] px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none" />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-[#6b3a2c] mb-1">Número</label>
                        <input {...register('street_number')} className="w-full rounded-lg border border-[#EADFC8] px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-[#6b3a2c] mb-1">Barrio</label>
                        <input {...register('neighborhood')} className="w-full rounded-lg border border-[#EADFC8] px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6b3a2c] mb-1">Ciudad</label>
                        <input {...register('city')} className="w-full rounded-lg border border-[#EADFC8] px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6b3a2c] mb-1">C.P.</label>
                        <input {...register('postal_code')} className="w-full rounded-lg border border-[#EADFC8] px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Fecha del pedido</label>
                    <input
                      type="date"
                      {...register('pickup_date')}
                      min={getMinDate()}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                    {errors.pickup_date && <p className="text-red-500 text-xs mt-1">{errors.pickup_date.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">Horario aprox. (opcional)</label>
                    <input
                      type="time"
                      {...register('pickup_time')}
                      className="w-full rounded-xl border border-[#EADFC8] bg-[#FAF7F2] px-4 py-3 text-[#2B0F0B] focus:border-[#C9A96E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div className="space-y-5 anim-rise">
                <h2 className="font-serif text-2xl text-[#2B0F0B] mb-6">Confirmá tu pedido</h2>

                <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#EADFC8] space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#2B0F0B] mb-2 flex items-center gap-2">
                      <CreditCard size={16} /> Productos
                    </h3>
                    <ul className="space-y-2 text-sm text-[#6b3a2c]">
                      {items.map((i) => (
                        <li key={i.product_id} className="flex justify-between">
                          <span>{i.quantity}x {i.name}</span>
                          <span>${(i.price * i.quantity).toLocaleString('es-AR')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-[#EADFC8] pt-4">
                    <h3 className="font-semibold text-[#2B0F0B] mb-2 flex items-center gap-2">
                      <MapPin size={16} /> Entrega
                    </h3>
                    <p className="text-sm text-[#6b3a2c]">
                      {deliveryType === 'pickup'
                        ? 'Retiro en local'
                        : `Envío a: ${watch('street')} ${watch('street_number')}, ${watch('neighborhood')}`}
                    </p>
                    <p className="text-sm text-[#6b3a2c] flex items-center gap-2 mt-1">
                      <Calendar size={14} /> {watch('pickup_date')}
                      {watch('pickup_time') && ` a las ${watch('pickup_time')}`}
                    </p>
                  </div>

                  <div className="border-t border-[#EADFC8] pt-4 flex justify-between items-center">
                    <span className="font-semibold text-[#2B0F0B]">Total a pagar</span>
                    <span className="font-serif text-2xl font-bold text-[#2B0F0B]">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#9a8b7a] text-center">
                  Revisá los datos y presioná <strong>Confirmar Pedido</strong> para continuar.
                </p>
              </div>
            )}

            {/* NAVEGACIÓN */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#EADFC8]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={submitting}
                  className="flex items-center gap-1 text-sm text-[#6b3a2c] hover:text-[#2B0F0B] transition disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Volver
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#2B0F0B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#5a1a10] transition shadow-md"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#C9A96E] text-[#2B0F0B] px-8 py-3.5 rounded-xl font-bold hover:bg-[#b0935a] transition shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Procesando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </main>
  )
}