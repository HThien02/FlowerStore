import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()
    const {
      userId,
      items,
      subtotal,
      deliveryCost,
      deliveryId,
      deliveryAddress,
      deliveryPhone,
      deliveryNotes,
      paymentMethod,
    } = body

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const total = subtotal + deliveryCost

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        subtotal,
        delivery_cost: deliveryCost,
        delivery_id: deliveryId,
        delivery_address: deliveryAddress,
        delivery_phone: deliveryPhone,
        delivery_notes: deliveryNotes,
        total,
        payment_method: paymentMethod,
        payment_status: 'pending',
      })
      .select()

    if (orderError || !order?.[0]) {
      throw orderError
    }

    const orderId = order[0].id

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        items.map((item: any) => ({
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          product_price: item.price,
          quantity: item.quantity,
        }))
      )

    if (itemsError) {
      throw itemsError
    }

    return NextResponse.json({
      orderId,
      total,
    })
  } catch (error) {
    console.error('[v0] Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
