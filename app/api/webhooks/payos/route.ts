import { NextRequest, NextResponse } from 'next/server'
import { getPayOS, isPayOSConfigured } from '@/lib/payos'
import { markOrderPaidByPayos } from '@/lib/orders/payos-payment'
import {
  isPayosWebhookPaymentSuccess,
  verifyPayosWebhookSignature,
  type PayosWebhookPayload,
} from '@/lib/payos-webhook'
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

  const orderCode = Number(body.data?.orderCode)
  const paymentLinkId =
    typeof body.data?.paymentLinkId === 'string' ? body.data.paymentLinkId : undefined

  console.info('[payos webhook] received', { orderCode, paymentLinkId, topCode: body.code })

  if (!isPayosWebhookPaymentSuccess(body)) {
    console.warn('[payos webhook] ignored non-success', body.code, body.data?.code, body.desc)
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (!body.data || !body.signature) {
    console.error('[payos webhook] missing data or signature')
    return NextResponse.json({ ok: true, error: 'missing_fields' })
  }

  const checksumKey = process.env.PAYOS_CHECKSUM_KEY!
  let verified = verifyPayosWebhookSignature(body.data, body.signature, checksumKey)

  if (!verified) {
    try {
      const payos = getPayOS()
      await payos.webhooks.verify(body)
      verified = true
    } catch (e) {
      console.error('[payos webhook] signature invalid', e)
      return NextResponse.json({ ok: true, verified: false })
    }
  }

  try {
    const admin = getSupabaseServerClient()

    let order: { id: string; payment_status: string | null; total: number } | null = null

    if (Number.isFinite(orderCode)) {
      const { data, error } = await admin
        .from('orders')
        .select('id, payment_status, total')
        .eq('payos_order_code', orderCode)
        .maybeSingle()
      if (error) throw error
      order = data
    }

    if (!order && paymentLinkId) {
      const { data, error } = await admin
        .from('orders')
        .select('id, payment_status, total')
        .eq('payos_payment_link_id', paymentLinkId)
        .maybeSingle()
      if (error) throw error
      order = data
    }

    if (!order) {
      console.warn('[payos webhook] order not found', orderCode, paymentLinkId)
      return NextResponse.json({ ok: true, message: 'Order not found' })
    }

    const paidAmount = Number(body.data.amount ?? 0)
    const orderTotal = Number(order.total ?? 0)
    if (paidAmount > 0 && orderTotal > 0 && paidAmount < orderTotal) {
      console.warn('[payos webhook] underpaid', order.id, paidAmount, orderTotal)
    }

    await markOrderPaidByPayos(admin, order.id, { paymentLinkId })

    console.info('[payos webhook] marked paid', order.id, orderCode, body.data.description)
    return NextResponse.json({ ok: true, orderId: order.id })
  } catch (e: unknown) {
    console.error('[payos webhook] handler', e, JSON.stringify(body))
    return NextResponse.json({ ok: true, error: 'handler_failed' })
  }
}
