// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const { customer, items } = await request.json()
    const supabase = await createClient()

    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const orderNumber = `BZ-${Date.now().toString().slice(-6)}`

    let fullAddress = null
    if (customer.delivery_type === 'delivery') {
      const parts = [
        `${customer.street} ${customer.street_number}`,
        customer.floor && `Piso ${customer.floor}`,
        customer.apartment && `Depto ${customer.apartment}`,
        customer.neighborhood,
        customer.city,
        customer.postal_code && `CP ${customer.postal_code}`,
      ].filter(Boolean)
      fullAddress = parts.join(', ')
    }

    const fullName = `${customer.first_name} ${customer.last_name}`.trim()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: fullName,
        customer_phone: customer.customer_phone,
        customer_email: customer.customer_email || null,
        delivery_type: customer.delivery_type,
        address: fullAddress,
        pickup_date: customer.pickup_date || null,
        pickup_time: customer.pickup_time || null,
        payment_reference: customer.payment_reference || null,
        birthdate: customer.birthdate || null, // 👈 NUEVO
        total,
        status: 'pending_payment',
        payment_method: 'transfer',
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.name,
      product_image: i.image_url || null,
      quantity: i.quantity,
      unit_price: i.price,
      subtotal: i.price * i.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creando pedido:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}