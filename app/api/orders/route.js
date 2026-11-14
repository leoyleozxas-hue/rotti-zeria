// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { orderSchema } from '@/lib/validations/order'
import { z } from 'zod'

const itemSchema = z.object({
  product_id: z.string().uuid('Producto inválido'),
  quantity: z.coerce.number().int().min(1, 'Cantidad inválida').max(99, 'Cantidad máxima por ítem: 99'),
})

const requestSchema = z.object({
  customer: orderSchema,
  items: z.array(itemSchema).min(1, 'El pedido no tiene productos'),
})

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.issues?.[0]
    return NextResponse.json(
      { success: false, error: first?.message || 'Datos inválidos', field: first?.path?.join('.') },
      { status: 400 }
    )
  }

  const { customer, items } = parsed.data

  // Agrupar duplicados (mismo producto con distintas cantidades)
  const grouped = new Map()
  for (const it of items) {
    grouped.set(it.product_id, (grouped.get(it.product_id) || 0) + it.quantity)
  }
  const normalized = [...grouped.entries()].map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }))

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('create_order', {
      p_customer: customer,
      p_items: normalized,
    })

    if (error) {
      console.error('create_order error:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'No se pudo crear el pedido' },
        { status: 500 }
      )
    }

    const settings = await getSettings()

    return NextResponse.json({
      success: true,
      order: data,
      bank: settings.bank,
      whatsapp: settings.whatsapp,
    })
  } catch (error) {
    console.error('Error creando pedido:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error inesperado' },
      { status: 500 }
    )
  }
}