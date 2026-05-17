import type { SupabaseClient } from '@supabase/supabase-js'
import {
  generatePayosOrderCode,
  getAppBaseUrl,
  getPayOS,
  isPayOSConfigured,
  payosDescription,
} from '@/lib/payos'
import { toPayosAmount } from '@/lib/pricing/currency'
import { notifyOrderEvent } from '@/lib/orders/notify-order'

const PAID_STATUSES = new Set(['PAID', 'PROCESSING'])

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

/**
 * Đồng bộ trạng thái từ PayOS API (khi webhook chưa kịp / chưa cấu hình).
 * Gọi sau khi khách quay về returnUrl hoặc khi poll payment-status.
 */
export async function syncPayosOrderPayment(
  admin: SupabaseClient,
  orderId: string
): Promise<{ payment_status: string; synced: boolean; payosStatus?: string }> {
  const { data: order, error } = await admin
    .from('orders')
    .select('id, payment_status, payos_order_code, payos_payment_link_id')
    .eq('id', orderId)
    .single()

  if (error || !order) throw new Error('Order not found')

  if (order.payment_status === 'completed') {
    return { payment_status: 'completed', synced: false }
  }

  if (!isPayOSConfigured()) {
    return { payment_status: order.payment_status ?? 'pending', synced: false }
  }

  const orderCode =
    order.payos_order_code != null && order.payos_order_code !== ''
      ? Number(order.payos_order_code)
      : NaN
  const linkId = order.payos_payment_link_id as string | null

  if (!Number.isFinite(orderCode) && !linkId) {
    return { payment_status: order.payment_status ?? 'pending', synced: false }
  }

  try {
    const payos = getPayOS()
    const link = Number.isFinite(orderCode)
      ? await payos.paymentRequests.get(orderCode)
      : await payos.paymentRequests.get(linkId!)

    const payosStatus = String(link.status ?? '')
    if (PAID_STATUSES.has(payosStatus) || link.amountRemaining === 0) {
      await markOrderPaidByPayos(admin, orderId, { paymentLinkId: link.id })
      return { payment_status: 'completed', synced: true, payosStatus }
    }

    return {
      payment_status: order.payment_status ?? 'pending',
      synced: false,
      payosStatus,
    }
  } catch (e) {
    console.error('[payos sync]', orderId, e)
    return { payment_status: order.payment_status ?? 'pending', synced: false }
  }
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
