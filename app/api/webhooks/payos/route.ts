import { NextRequest, NextResponse } from 'next/server'
import { getPayOS, isPayOSConfigured } from '@/lib/payos'
import { markOrderPaidByPayos } from '@/lib/orders/payos-payment'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!isPayOSConfigured()) {
    return NextResponse.json({ error: 'PayOS not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const payos = getPayOS()
    const data = await payos.webhooks.verify(body)

    if (!data || typeof data.orderCode !== 'number') {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    const admin = getSupabaseServerClient()
    const { data: order, error } = await admin
      .from('orders')
      .select('id, payment_status')
      .eq('payos_order_code', data.orderCode)
      .maybeSingle()

    if (error) {
      console.error('[payos webhook] lookup', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!order) {
      console.warn('[payos webhook] unknown orderCode', data.orderCode)
      return NextResponse.json({ ok: true, message: 'Order not found' })
    }

    await markOrderPaidByPayos(admin, order.id, {
      paymentLinkId:
        typeof data.paymentLinkId === 'string' ? data.paymentLinkId : undefined,
    })

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error('[payos webhook]', e)
    const msg = e instanceof Error ? e.message : 'Webhook failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
