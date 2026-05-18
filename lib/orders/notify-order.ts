import { getSupabaseServerClient } from '@/lib/supabase'
import { sendEmail, getAdminNotifyEmails } from '@/lib/email/send'
import {
  orderPlacedCustomerEmail,
  orderPlacedAdminEmail,
  paymentSuccessEmail,
  orderCancelledEmail,
  orderStatusUpdatedEmail,
  pickupReminderEmail,
  prepReminderStaffEmail,
  type OrderEmailContext,
} from '@/lib/email/templates/order-emails'

export type NotifyEvent =
  | 'placed'
  | 'payment_success'
  | 'cancelled'
  | 'status_updated'
  | 'pickup_reminder'
  | 'prep_reminder_staff'

async function loadOrderContext(orderId: string, locale?: 'en' | 'vi'): Promise<OrderEmailContext | null> {
  const admin = getSupabaseServerClient()

  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).single()
  if (!order) return null

  const { data: items } = await admin.from('order_items').select('*').eq('order_id', orderId)

  let staffName: string | null = null
  const { data: assignment } = await admin
    .from('order_staff_assignments')
    .select('staff_id')
    .eq('order_id', orderId)
    .maybeSingle()

  if (assignment?.staff_id) {
    const { data: profile } = await admin
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', assignment.staff_id)
      .maybeSingle()
    if (profile) staffName = profile.full_name || profile.email || null
  }

  const customerName =
    (order.customer_name as string) ||
    (order.delivery_address as string)?.split(',')[0] ||
    'Customer'

  return {
    orderId,
    customerName,
    customerEmail: (order.customer_email as string) || '',
    items: (items ?? []).map((i) => ({
      productName: i.product_name as string,
      quantity: i.quantity as number,
      price: Number(i.product_price),
    })),
    subtotal: Number(order.subtotal),
    deliveryCost: Number(order.delivery_cost ?? 0),
    afterHoursFee: Number(order.after_hours_fee ?? 0),
    total: Number(order.total),
    fulfillmentType: (order.fulfillment_type as 'pickup' | 'home') || 'pickup',
    deliveryAddress: (order.delivery_address as string) || null,
    deliveryPhone: (order.delivery_phone as string) || null,
    deliveryNotes: (order.delivery_notes as string) || null,
    paymentMethod: (order.payment_method as string) || null,
    paymentStatus: (order.payment_status as string) || null,
    scheduledAt: order.scheduled_at as string | null,
    prepScheduledAt: order.prep_scheduled_at as string | null,
    staffName,
    locale,
  }
}

export async function notifyOrderEvent(
  orderId: string,
  event: NotifyEvent,
  opts?: { locale?: 'en' | 'vi'; staffEmail?: string; previousStatus?: string; newStatus?: string }
) {
  const ctx = await loadOrderContext(orderId, opts?.locale)
  if (!ctx || !ctx.customerEmail) return

  const admins = getAdminNotifyEmails()

  switch (event) {
    case 'placed': {
      const customer = orderPlacedCustomerEmail(ctx)
      await sendEmail({ to: ctx.customerEmail, subject: customer.subject, html: customer.html })
      if (admins.length) {
        const adminMail = orderPlacedAdminEmail(ctx)
        await sendEmail({ to: admins, subject: adminMail.subject, html: adminMail.html })
      }
      break
    }
    case 'payment_success': {
      const mail = paymentSuccessEmail(ctx)
      await sendEmail({ to: ctx.customerEmail, subject: mail.subject, html: mail.html })
      if (admins.length) {
        const adminMail = orderPlacedAdminEmail({ ...ctx, locale: 'en' })
        await sendEmail({
          to: admins,
          subject: `💳 Paid — #${ctx.orderId.slice(0, 8)}`,
          html: adminMail.html,
        })
      }
      break
    }
    case 'cancelled': {
      const mail = orderCancelledEmail(ctx)
      await sendEmail({ to: ctx.customerEmail, subject: mail.subject, html: mail.html })
      if (admins.length) {
        await sendEmail({
          to: admins,
          subject: `Cancelled — #${ctx.orderId.slice(0, 8)}`,
          html: mail.html,
        })
      }
      break
    }
    case 'status_updated': {
      if (!opts?.previousStatus || !opts?.newStatus || opts.previousStatus === opts.newStatus) break
      if (opts.newStatus === 'cancelled') break
      const mail = orderStatusUpdatedEmail({
        ...ctx,
        previousStatus: opts.previousStatus,
        newStatus: opts.newStatus,
      })
      await sendEmail({ to: ctx.customerEmail, subject: mail.subject, html: mail.html })
      break
    }
    case 'pickup_reminder': {
      const mail = pickupReminderEmail(ctx)
      await sendEmail({ to: ctx.customerEmail, subject: mail.subject, html: mail.html })
      break
    }
    case 'prep_reminder_staff': {
      if (!opts?.staffEmail) break
      const mail = prepReminderStaffEmail({ ...ctx, staffEmail: opts.staffEmail })
      await sendEmail({ to: opts.staffEmail, subject: mail.subject, html: mail.html })
      break
    }
  }
}
