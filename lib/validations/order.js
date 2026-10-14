// lib/validations/order.js
import { z } from 'zod'

const today = new Date()
today.setHours(0, 0, 0, 0)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

export const orderSchema = z
  .object({
    first_name: z.string().min(2, 'Ingresá tu nombre'),
    last_name: z.string().min(2, 'Ingresá tu apellido'),
    dni: z.string().min(6, 'Ingresá tu DNI').max(10),
    customer_phone: z.string().min(6, 'Ingresá un teléfono válido'),
    customer_email: z.string().email('Email inválido').optional().or(z.literal('')),

    delivery_type: z.enum(['pickup', 'delivery']),

    pickup_date: z.string().min(1, 'Elegí una fecha'),
    pickup_time: z.string().optional(),

    street: z.string().optional(),
    street_number: z.string().optional(),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),

    payment_reference: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.pickup_date) return false
      const selected = new Date(data.pickup_date + 'T00:00:00')
      return selected >= tomorrow
    },
    {
      message: 'La fecha debe ser a partir de mañana',
      path: ['pickup_date'],
    }
  )
  .refine(
    (data) => {
      if (!data.pickup_date) return true
      const selected = new Date(data.pickup_date + 'T00:00:00')
      return selected.getDay() !== 0 // 0 = domingo
    },
    {
      message: 'No trabajamos los domingos',
      path: ['pickup_date'],
    }
  )
  .refine(
    (data) =>
      data.delivery_type !== 'delivery' ||
      (data.street && data.street.length > 2 && data.street_number && data.neighborhood),
    {
      message: 'Completá los datos de dirección',
      path: ['street'],
    }
  )