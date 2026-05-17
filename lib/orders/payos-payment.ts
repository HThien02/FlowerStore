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

const PAID_STATUSES = new Set(['PAID', 'PROCESSING', 'COMPLETED', 'SUCCESS'])

export type PayosSyncResult = {
  payment_status: string
  synced: boolean
  payosStatus?: string
  amount?: number
  amountPaid?: number
  amountRemaining?: number
}

async function cancelPayosLinkIfPending(payos: ReturnType<typeof getPayOS>, orderCode: number) {
  try {
    await payos.paymentRequests.cancel(orderCode)
  } catch (e) {
    console.warn('[payos] cancel previous link', orderCode, e)
  }
}

export async function createPayosCheckoutForOrder(
  admin: SupabaseClient,
  orderId: string,
  locale: string
): Promise<{ checkoutUrl: string; orderCode: number; amountVnd: number; description: string }> {
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
  const payos = getPayOS()

  const previousCode =
    order.payos_order_code != null && String(order.payos_order_code) !== ''
      ? Number(order.payos_order_code)
      : NaN
  if (Number.isFinite(previousCode)) {
    await cancelPayosLinkIfPending(payos, previousCode)
  }

  const orderCode = generatePayosOrderCode()
  const description = payosDescription(orderCode)

  const base = getAppBaseUrl()
  const loc = locale === 'vi' ? 'vi' : 'en'
  const returnUrl = `${base}/api/payos/return?orderId=${encodeURIComponent(orderId)}&locale=${loc}`
  const cancelUrl = `${base}/${loc}/checkout?cancelled=1`

  const link = await payos.paymentRequests.create({
    orderCode,
    amount: amountVnd,
    description,
    returnUrl,
    cancelUrl,
  })

  console.info('[payos] link created', {
    orderId,
    orderCode,
    amountVnd,
    description,
    paymentLinkId: link.paymentLinkId,
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

  return { checkoutUrl: link.checkoutUrl, orderCode, amountVnd, description }
}

/**
 * Đồng bộ trạng thái từ PayOS API (khi webhook chưa kịp / chưa cấu hình).
 * Gọi sau khi khách quay về returnUrl hoặc khi poll payment-status.
 */
export async function syncPayosOrderPayment(
  admin: SupabaseClient,
  orderId: string
): Promise<PayosSyncResult> {
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

    const payosStatus = String(link.status ?? '').toUpperCase()
    const amount = Number(link.amount ?? 0)
    const amountPaid = Number(link.amountPaid ?? 0)
    const amountRemaining = Number(link.amountRemaining ?? amount)
    const fullyPaid =
      PAID_STATUSES.has(payosStatus) ||
      amountRemaining <= 0 ||
      (amount > 0 && amountPaid >= amount)

    const baseResult: PayosSyncResult = {
      payment_status: order.payment_status ?? 'pending',
      synced: false,
      payosStatus,
      amount,
      amountPaid,
      amountRemaining,
    }

    if (fullyPaid) {
      await markOrderPaidByPayos(admin, orderId, { paymentLinkId: link.id })
      return { ...baseResult, payment_status: 'completed', synced: true }
    }

    return baseResult
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
