import { NextRequest, NextResponse } from 'next/server'
import { placeOrder } from '@/lib/orders/place-order'
import { createPayosCheckoutForOrder } from '@/lib/orders/payos-payment'
import { isPayOSConfigured } from '@/lib/payos'
import { getSupabaseServerClient } from '@/lib/supabase'

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

    if (paymentMethod === 'payos' && fulfillmentType !== 'home' && !isPayOSConfigured()) {
      return NextResponse.json(
        { error: 'PayOS is not configured on the server' },
        { status: 503 }
      )
    }

    const usePayos =
      paymentMethod === 'payos' && fulfillmentType !== 'home' && isPayOSConfigured()

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
      paymentMethod: usePayos ? 'payos' : paymentMethod,
      fulfillmentType: fulfillmentType === 'home' ? 'home' : 'pickup',
      scheduledAt,
      locale: locale === 'vi' ? 'vi' : 'en',
    })

    let checkoutUrl: string | undefined
    let amount: number | undefined
    let payosOrderCode: number | undefined
    let payosDescription: string | undefined

    if (usePayos) {
      const admin = getSupabaseServerClient()
      try {
        const payos = await createPayosCheckoutForOrder(
          admin,
          result.orderId,
          locale === 'vi' ? 'vi' : 'en'
        )
        checkoutUrl = payos.checkoutUrl
        amount = payos.amount
        payosOrderCode = payos.orderCode
        payosDescription = payos.description
      } catch (payosErr) {
        console.error('[create-order] PayOS link failed, removing orphan order', result.orderId, payosErr)
        await admin.from('orders').delete().eq('id', result.orderId)
        const msg =
          payosErr instanceof Error ? payosErr.message : 'Could not create PayOS payment link'
        return NextResponse.json({ error: msg }, { status: 502 })
      }
    }

    return NextResponse.json({
      orderId: result.orderId,
      total: result.total,
      checkoutUrl,
      amount,
      payosOrderCode,
      payosDescription,
      prepScheduledAt: result.assignment.prepAt.toISOString(),
      staffId: result.assignment.staffId,
    })
  } catch (error) {
    console.error('[create-order]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
