import { NextRequest, NextResponse } from 'next/server'
import { getPayOS, isPayOSConfigured } from '@/lib/payos'
import { markOrderPaidByPayos } from '@/lib/orders/payos-payment'
import { getSupabaseServerClient } from '@/lib/supabase'

type PayosWebhookBody = {
  code?: string
  desc?: string
  success?: boolean
  data?: { orderCode?: number | string }
  signature?: string
}

/** PayOS gọi POST khi có giao dịch; phải trả 200 để xác nhận đã nhận. */
export async function POST(request: NextRequest) {
  if (!isPayOSConfigured()) {
    return NextResponse.json({ error: 'PayOS not configured' }, { status: 503 })
  }

  let body: PayosWebhookBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    if (body.code && body.code !== '00') {
      console.warn('[payos webhook] non-success code', body.code, body.desc)
      return NextResponse.json({ ok: true })
    }

    const payos = getPayOS()
    const data = await payos.webhooks.verify(body)

    const orderCode = Number(data.orderCode)
    if (!Number.isFinite(orderCode)) {
      console.error('[payos webhook] invalid orderCode', data)
      return NextResponse.json({ error: 'Invalid orderCode' }, { status: 400 })
    }

    const admin = getSupabaseServerClient()
    const { data: order, error } = await admin
      .from('orders')
      .select('id, payment_status')
      .eq('payos_order_code', orderCode)
      .maybeSingle()

    if (error) {
      console.error('[payos webhook] lookup', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!order) {
      console.warn('[payos webhook] unknown orderCode', orderCode)
      return NextResponse.json({ ok: true, message: 'Order not found' })
    }

    await markOrderPaidByPayos(admin, order.id, {
      paymentLinkId:
        typeof data.paymentLinkId === 'string' ? data.paymentLinkId : undefined,
    })

    console.info('[payos webhook] marked paid', order.id, orderCode)
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error('[payos webhook]', e, JSON.stringify(body))
    const msg = e instanceof Error ? e.message : 'Webhook failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
