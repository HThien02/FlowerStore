import { emailShell } from '../layout'
import { escapeHtml } from '../escape-html'
import { formatMoney } from '@/lib/pricing/currency'

export type OrderEmailItem = {
  productName: string
  quantity: number
  price: number
}

export type OrderEmailContext = {
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderEmailItem[]
  total: number
  fulfillmentType: 'pickup' | 'home'
  scheduledAt?: string | null
  prepScheduledAt?: string | null
  staffName?: string | null
  locale?: 'en' | 'vi'
}

function fmtMoney(n: number, locale: 'en' | 'vi' = 'vi') {
  return formatMoney(n, locale)
}

function fmtDate(iso: string | null | undefined, locale: 'en' | 'vi') {
  if (!iso) return locale === 'vi' ? 'Chưa xác định' : 'TBD'
  return new Date(iso).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function itemsTable(items: OrderEmailItem[], locale: 'en' | 'vi') {
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">${escapeHtml(i.productName)} × ${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;text-align:right;">${fmtMoney(i.price * i.quantity, locale)}</td>
        </tr>`
    )
    .join('')
  return `<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
}

function orderDetailsBody(ctx: OrderEmailContext, locale: 'en' | 'vi') {
  const fulfillment =
    ctx.fulfillmentType === 'home'
      ? locale === 'vi'
        ? 'Giao tại nhà'
        : 'Home delivery'
      : locale === 'vi'
        ? 'Nhận tại cửa hàng'
        : 'Store pickup'

  return `
    <p style="margin:0 0 12px;">${locale === 'vi' ? 'Mã đơn' : 'Order'}: <strong>#${escapeHtml(ctx.orderId.slice(0, 8))}</strong></p>
    <p style="margin:0 0 12px;">${locale === 'vi' ? 'Hình thức' : 'Type'}: <strong>${fulfillment}</strong></p>
    <p style="margin:0 0 12px;">${locale === 'vi' ? 'Thời gian nhận/giao' : 'Scheduled time'}: <strong>${fmtDate(ctx.scheduledAt, locale)}</strong></p>
    ${
      ctx.prepScheduledAt
        ? `<p style="margin:0 0 12px;font-size:14px;color:#71717a;">${
            locale === 'vi'
              ? `Shop chuẩn bị từ: ${fmtDate(ctx.prepScheduledAt, locale)}`
              : `We start preparing at: ${fmtDate(ctx.prepScheduledAt, locale)}`
          }${ctx.staffName ? ` · ${escapeHtml(ctx.staffName)}` : ''}</p>`
        : ''
    }
    <div style="margin:16px 0;">${itemsTable(ctx.items, locale)}</div>
    <p style="margin:12px 0 0;font-size:17px;"><strong>${locale === 'vi' ? 'Tổng' : 'Total'}: ${fmtMoney(ctx.total, locale)}</strong></p>
  `
}

export function orderPlacedCustomerEmail(ctx: OrderEmailContext) {
  const locale = ctx.locale ?? 'en'
  const title = locale === 'vi' ? 'Đặt hàng thành công!' : 'Order placed successfully!'
  const body = `
    <p>${locale === 'vi' ? `Xin chào ${escapeHtml(ctx.customerName)},` : `Hi ${escapeHtml(ctx.customerName)},`}</p>
    <p>${locale === 'vi' ? 'Cảm ơn bạn đã đặt hoa tại cửa hàng chúng tôi.' : 'Thank you for ordering from our flower shop.'}</p>
    ${orderDetailsBody(ctx, locale)}
  `
  return {
    subject: locale === 'vi' ? `✿ Đơn hàng #${ctx.orderId.slice(0, 8)} đã được tạo` : `✿ Order #${ctx.orderId.slice(0, 8)} confirmed`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

export function orderPlacedAdminEmail(ctx: OrderEmailContext) {
  const title = 'New order received'
  const body = `
    <p>A new order needs attention.</p>
    <p>Customer: <strong>${escapeHtml(ctx.customerName)}</strong> (${escapeHtml(ctx.customerEmail)})</p>
    ${orderDetailsBody(ctx, 'en')}
  `
  return {
    subject: `🌸 New order #${ctx.orderId.slice(0, 8)}`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

export function paymentSuccessEmail(ctx: OrderEmailContext) {
  const locale = ctx.locale ?? 'en'
  const title = locale === 'vi' ? 'Thanh toán thành công' : 'Payment received'
  const body = `
    <p>${locale === 'vi' ? 'Thanh toán của bạn đã được xác nhận.' : 'Your payment was successful.'}</p>
    ${orderDetailsBody(ctx, locale)}
  `
  return {
    subject: locale === 'vi' ? `✓ Đã thanh toán — #${ctx.orderId.slice(0, 8)}` : `✓ Paid — order #${ctx.orderId.slice(0, 8)}`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

export function orderCancelledEmail(ctx: OrderEmailContext) {
  const locale = ctx.locale ?? 'en'
  const title = locale === 'vi' ? 'Đơn hàng đã hủy' : 'Order cancelled'
  const body = `
    <p>${locale === 'vi' ? 'Đơn hàng của bạn đã được hủy.' : 'Your order has been cancelled.'}</p>
    ${orderDetailsBody(ctx, locale)}
    <p style="color:#71717a;font-size:14px;">${locale === 'vi' ? 'Liên hệ shop nếu bạn cần hỗ trợ.' : 'Contact us if you have questions.'}</p>
  `
  return {
    subject: locale === 'vi' ? `Đơn #${ctx.orderId.slice(0, 8)} đã hủy` : `Order #${ctx.orderId.slice(0, 8)} cancelled`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

export function pickupReminderEmail(ctx: OrderEmailContext) {
  const locale = ctx.locale ?? 'en'
  const title = locale === 'vi' ? 'Nhắc nhận hoa' : 'Flower pickup reminder'
  const body = `
    <p>${locale === 'vi' ? `Xin chào ${escapeHtml(ctx.customerName)},` : `Hi ${escapeHtml(ctx.customerName)},`}</p>
    <p>${
      locale === 'vi'
        ? `Đơn hàng của bạn sẽ sẵn sàng vào khoảng <strong>${fmtDate(ctx.scheduledAt, locale)}</strong>. Hẹn gặp bạn tại cửa hàng!`
        : `Your flowers will be ready around <strong>${fmtDate(ctx.scheduledAt, locale)}</strong>. See you at the shop!`
    }</p>
    ${orderDetailsBody(ctx, locale)}
  `
  return {
    subject: locale === 'vi' ? `🌷 Nhắc nhận hoa — #${ctx.orderId.slice(0, 8)}` : `🌷 Pickup reminder — #${ctx.orderId.slice(0, 8)}`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

const STATUS_LABELS: Record<string, { en: string; vi: string }> = {
  pending: { en: 'Pending', vi: 'Chờ xử lý' },
  processing: { en: 'Processing', vi: 'Đang chuẩn bị' },
  shipped: { en: 'Shipped', vi: 'Đang giao' },
  delivered: { en: 'Delivered', vi: 'Đã giao / nhận' },
  cancelled: { en: 'Cancelled', vi: 'Đã hủy' },
}

export function orderStatusUpdatedEmail(
  ctx: OrderEmailContext & { previousStatus: string; newStatus: string }
) {
  const locale = ctx.locale ?? 'en'
  const prev = STATUS_LABELS[ctx.previousStatus]?.[locale] ?? ctx.previousStatus
  const next = STATUS_LABELS[ctx.newStatus]?.[locale] ?? ctx.newStatus
  const title = locale === 'vi' ? 'Cập nhật đơn hàng' : 'Order status updated'
  const body = `
    <p>${locale === 'vi' ? `Xin chào ${escapeHtml(ctx.customerName)},` : `Hi ${escapeHtml(ctx.customerName)},`}</p>
    <p>${
      locale === 'vi'
        ? `Trạng thái đơn hàng của bạn đã được cập nhật: <strong>${prev}</strong> → <strong>${next}</strong>.`
        : `Your order status has been updated: <strong>${prev}</strong> → <strong>${next}</strong>.`
    }</p>
    ${orderDetailsBody(ctx, locale)}
    <p style="color:#71717a;font-size:14px;">${
      locale === 'vi' ? 'Cảm ơn bạn đã tin tưởng TFlowers!' : 'Thank you for shopping with TFlowers!'
    }</p>
  `
  return {
    subject:
      locale === 'vi'
        ? `✿ Đơn #${ctx.orderId.slice(0, 8)} — ${next}`
        : `✿ Order #${ctx.orderId.slice(0, 8)} — ${next}`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

export function prepReminderStaffEmail(
  ctx: OrderEmailContext & { staffEmail: string }
) {
  const title = 'Prep reminder — order starting soon'
  const body = `
    <p>Hi team,</p>
    <p>Start preparing order <strong>#${escapeHtml(ctx.orderId.slice(0, 8))}</strong> at <strong>${fmtDate(ctx.prepScheduledAt, 'en')}</strong>.</p>
    <p>Customer pickup/delivery: <strong>${fmtDate(ctx.scheduledAt, 'en')}</strong></p>
    ${orderDetailsBody(ctx, 'en')}
  `
  return {
    subject: `⏰ Prep in 1h — order #${ctx.orderId.slice(0, 8)}`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}
