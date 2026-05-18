import { NextRequest, NextResponse } from 'next/server'
import { getPayOS, isPayOSConfigured } from '@/lib/payos'
import { markOrderPaidByPayos } from '@/lib/orders/payos-payment'
import type { PayosWebhookData, PayosWebhookPayload } from '@/lib/payos-webhook'
import { findOrderForPayosEvent } from '@/lib/orders/payos-lookup'
import { getSupabaseServerClient } from '@/lib/supabase'

/** PayOS gọi POST khi có giao dịch; phải trả 2xx để xác nhận đã nhận. */
export async function POST(request: NextRequest) {
  let body: PayosWebhookPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isPayOSConfigured()) {
    return NextResponse.json({ error: 'PayOS not configured' }, { status: 503 })
  }

  if (!body.data || !body.signature) {
    console.error('[payos webhook] missing data or signature')
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const payos = getPayOS()
  let data: PayosWebhookData
  try {
    data = await payos.webhooks.verify(body)
  } catch (e) {
    console.error('[payos webhook] verify failed', e)
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  const orderCode = Number(data.orderCode)
  const paymentLinkId = typeof data.paymentLinkId === 'string' ? data.paymentLinkId : undefined

  console.info('[payos webhook] verified', { orderCode, paymentLinkId, code: data.code })

  if (data.code && data.code !== '00') {
    console.warn('[payos webhook] ignored non-success data.code', data.code, data.desc)
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (!Number.isFinite(orderCode)) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  try {
    const admin = getSupabaseServerClient()

    const order = await findOrderForPayosEvent(admin, {
      orderCode,
      paymentLinkId,
      description: data.description,
    })

    if (!order) {
      console.warn('[payos webhook] order not found', {
        orderCode,
        paymentLinkId,
        description: data.description,
      })
      return NextResponse.json({ ok: true, message: 'Order not found' })
    }

    const paidAmount = Number(data.amount ?? 0)
    const orderTotal = Number(order.total ?? 0)
    if (paidAmount > 0 && orderTotal > 0 && paidAmount < orderTotal) {
      console.warn('[payos webhook] underpaid', order.id, paidAmount, orderTotal)
    }

    await markOrderPaidByPayos(admin, order.id, { paymentLinkId })

    console.info('[payos webhook] marked paid', order.id, orderCode, data.description)
    return new NextResponse('OK', { status: 200 })
  } catch (e: unknown) {
    console.error('[payos webhook] handler', e, JSON.stringify(body))
    return NextResponse.json({ ok: true, error: 'handler_failed' })
  }
}
