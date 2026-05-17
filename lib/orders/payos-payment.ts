import type { SupabaseClient } from '@supabase/supabase-js'
import { generatePayosOrderCode, getAppBaseUrl, getPayOS, payosDescription } from '@/lib/payos'
import { toPayosAmount } from '@/lib/pricing/currency'
import { notifyOrderEvent } from '@/lib/orders/notify-order'

export async function createPayosCheckoutForOrder(
  admin: SupabaseClient,
  orderId: string,
  locale: string
): Promise<{ checkoutUrl: string; orderCode: number; amountVnd: number }> {
  const { data: order, error } = await admin
    .from('orders')
    .select('id, total, payment_status, payos_order_code')
    .eq('id', orderId)
    .single()

  if (error || !order) throw new Error('Order not found')

  if (order.payment_status === 'completed') {
    throw new Error('Order already paid')
  }

  const amountVnd = toPayosAmount(Number(order.total))
  const orderCode =
    order.payos_order_code != null ? Number(order.payos_order_code) : generatePayosOrderCode()

  const base = getAppBaseUrl()
  const loc = locale === 'vi' ? 'vi' : 'en'
  const returnUrl = `${base}/${loc}/order-success?orderId=${orderId}&payos=1`
  const cancelUrl = `${base}/${loc}/checkout?cancelled=1`

  const payos = getPayOS()
  const link = await payos.paymentRequests.create({
    orderCode,
    amount: amountVnd,
    description: payosDescription(orderId),
    returnUrl,
    cancelUrl,
  })

  const { error: upErr } = await admin
    .from('orders')
    .update({
      payos_order_code: orderCode,
      payos_payment_link_id: link.paymentLinkId,
      payment_method: 'payos',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (upErr) throw upErr

  return { checkoutUrl: link.checkoutUrl, orderCode, amountVnd }
}

export async function markOrderPaidByPayos(
  admin: SupabaseClient,
  orderId: string,
  opts?: { paymentLinkId?: string }
) {
  const { data: order } = await admin
    .from('orders')
    .select('payment_status')
    .eq('id', orderId)
    .single()

  if (!order || order.payment_status === 'completed') return

  const { error } = await admin
    .from('orders')
    .update({
      payment_status: 'completed',
      payment_method: 'payos',
      status: 'processing',
      payos_payment_link_id: opts?.paymentLinkId ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) throw error

  void notifyOrderEvent(orderId, 'payment_success').catch((e) =>
    console.error('[payos] notify', e)
  )
}
