import { getSupabaseServerClient } from '@/lib/supabase'
import { assignOrderPrepSchedule } from '@/lib/scheduling/assign-prep-slot'
import { notifyOrderEvent } from '@/lib/orders/notify-order'
import { orderTotalWithFees } from '@/lib/pricing/business-hours'

export type PlaceOrderItem = {
  productId: string
  productName: string
  price: number
  quantity: number
}

export type PlaceOrderInput = {
  userId?: string | null
  customerEmail: string
  customerName: string
  items: PlaceOrderItem[]
  subtotal: number
  deliveryCost: number
  deliveryId?: string | null
  deliveryAddress: string
  deliveryPhone: string
  deliveryNotes?: string
  paymentMethod?: string
  fulfillmentType: 'pickup' | 'home'
  scheduledAt: string
  locale?: 'en' | 'vi'
  paymentStatus?: 'pending' | 'completed'
  status?: string
}

export async function placeOrder(input: PlaceOrderInput) {
  const admin = getSupabaseServerClient()
  const scheduledAt = new Date(input.scheduledAt)
  const { afterHoursFee, total } = orderTotalWithFees(
    input.subtotal,
    input.deliveryCost ?? 0,
    scheduledAt
  )
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error('Invalid scheduled time')
  }

  const deliveryId =
    input.deliveryId && input.deliveryId !== 'pickup-in-store' ? input.deliveryId : null

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: input.userId ?? null,
      customer_email: input.customerEmail,
      customer_name: input.customerName,
      status: input.status ?? 'pending',
      subtotal: input.subtotal,
      delivery_cost: input.deliveryCost,
      after_hours_fee: afterHoursFee,
      delivery_id: deliveryId,
      delivery_address: input.deliveryAddress,
      delivery_phone: input.deliveryPhone,
      delivery_notes: input.deliveryNotes ?? null,
      total,
      payment_method: input.paymentMethod ?? null,
      payment_status: input.paymentStatus ?? 'pending',
      fulfillment_type: input.fulfillmentType,
      scheduled_at: scheduledAt.toISOString(),
    })
    .select()
    .single()

  if (orderError || !order) throw orderError ?? new Error('Order insert failed')

  const orderId = order.id as string

  const { error: itemsError } = await admin.from('order_items').insert(
    input.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.price,
      quantity: item.quantity,
    }))
  )
  if (itemsError) throw itemsError

  const assignment = await assignOrderPrepSchedule(admin, orderId, scheduledAt)

  void notifyOrderEvent(orderId, 'placed', { locale: input.locale }).catch((e) =>
    console.error('[placeOrder] email', e)
  )

  return { orderId, total, afterHoursFee, assignment }
}
