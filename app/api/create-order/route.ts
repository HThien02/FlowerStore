import { NextRequest, NextResponse } from 'next/server'
import { placeOrder } from '@/lib/orders/place-order'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      customerEmail,
      customerName,
      items,
      subtotal,
      deliveryCost,
      deliveryId,
      deliveryAddress,
      deliveryPhone,
      deliveryNotes,
      paymentMethod,
      fulfillmentType,
      scheduledAt,
      locale,
    } = body

    if (!items?.length || !customerEmail?.trim() || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing items, email, or scheduled time' },
        { status: 400 }
      )
    }

    const result = await placeOrder({
      userId: userId ?? null,
      customerEmail: customerEmail.trim(),
      customerName: customerName?.trim() || customerEmail,
      items,
      subtotal,
      deliveryCost: deliveryCost ?? 0,
      deliveryId,
      deliveryAddress: deliveryAddress ?? 'Pickup at store',
      deliveryPhone,
      deliveryNotes,
      paymentMethod,
      fulfillmentType: fulfillmentType === 'home' ? 'home' : 'pickup',
      scheduledAt,
      locale: locale === 'vi' ? 'vi' : 'en',
    })

    return NextResponse.json({
      orderId: result.orderId,
      total: result.total,
      prepScheduledAt: result.assignment.prepAt.toISOString(),
      staffId: result.assignment.staffId,
    })
  } catch (error) {
    console.error('[create-order]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
