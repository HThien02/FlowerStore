import { NextRequest, NextResponse } from 'next/server'
import { placeOrder } from '@/lib/orders/place-order'
import type { HomeDeliveryForm } from '@/lib/email/templates/home-delivery-request'

type Body = HomeDeliveryForm & {
  locale?: string
  userId?: string | null
  scheduledAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const { locale = 'en', deliveryInfo, items, subtotal, userId, scheduledAt } = body

    if (!deliveryInfo?.email?.trim() || !items?.length) {
      return NextResponse.json({ error: 'Missing email or items' }, { status: 400 })
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: 'Missing scheduled delivery time' }, { status: 400 })
    }

    const address = [deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode]
      .filter(Boolean)
      .join(', ')

    const customerName = `${deliveryInfo.firstName} ${deliveryInfo.lastName}`.trim()

    const result = await placeOrder({
      userId: userId ?? null,
      customerEmail: deliveryInfo.email.trim(),
      customerName,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      deliveryCost: 0,
      deliveryAddress: address || deliveryInfo.address,
      deliveryPhone: deliveryInfo.phone,
      deliveryNotes: deliveryInfo.notes,
      paymentMethod: 'pending_staff',
      fulfillmentType: 'home',
      scheduledAt,
      locale: locale === 'vi' ? 'vi' : 'en',
      paymentStatus: 'pending',
      status: 'pending',
    })

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      prepScheduledAt: result.assignment.prepAt.toISOString(),
    })
  } catch (e) {
    console.error('[checkout-home-request]', e)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
