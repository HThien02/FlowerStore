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
  subtotal: number
  deliveryCost: number
  afterHoursFee: number
  total: number
  fulfillmentType: 'pickup' | 'home'
  deliveryAddress?: string | null
  deliveryPhone?: string | null
  deliveryNotes?: string | null
  paymentMethod?: string | null
  paymentStatus?: string | null
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

function orderTotalsTable(ctx: OrderEmailContext, locale: 'en' | 'vi') {
  const rows: string[] = []

  rows.push(`
    <tr>
      <td style="padding:8px 0;color:#52525b;">${locale === 'vi' ? 'Tạm tính sản phẩm' : 'Subtotal'}</td>
      <td style="padding:8px 0;text-align:right;">${fmtMoney(ctx.subtotal, locale)}</td>
    </tr>
  `)

  if (ctx.fulfillmentType === 'home') {
    const farNote = ctx.deliveryNotes?.includes('Giao xa >20km')
    if (ctx.deliveryCost > 0) {
      rows.push(`
        <tr>
          <td style="padding:8px 0;color:#52525b;">${locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee'}</td>
          <td style="padding:8px 0;text-align:right;">${fmtMoney(ctx.deliveryCost, locale)}</td>
        </tr>
      `)
    } else if (farNote) {
      rows.push(`
        <tr>
          <td style="padding:8px 0;color:#52525b;">${locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee'}</td>
          <td style="padding:8px 0;text-align:right;color:#b45309;">${locale === 'vi' ? 'Nhân viên báo sau' : 'Quoted by staff'}</td>
        </tr>
      `)
    } else {
      rows.push(`
        <tr>
          <td style="padding:8px 0;color:#52525b;">${locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee'}</td>
          <td style="padding:8px 0;text-align:right;">${locale === 'vi' ? 'Miễn phí' : 'Free'}</td>
        </tr>
      `)
    }
  } else if (ctx.deliveryCost > 0) {
    rows.push(`
      <tr>
        <td style="padding:8px 0;color:#52525b;">${locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee'}</td>
        <td style="padding:8px 0;text-align:right;">${fmtMoney(ctx.deliveryCost, locale)}</td>
      </tr>
    `)
  }

  if (ctx.afterHoursFee > 0) {
    rows.push(`
      <tr>
        <td style="padding:8px 0;color:#b45309;">${locale === 'vi' ? 'Phụ thu ngoài giờ (10%)' : 'After-hours surcharge (10%)'}</td>
        <td style="padding:8px 0;text-align:right;color:#b45309;">+${fmtMoney(ctx.afterHoursFee, locale)}</td>
      </tr>
    `)
  }

  rows.push(`
    <tr>
      <td style="padding:12px 0 0;font-size:17px;font-weight:700;border-top:2px solid #e4e4e7;">${locale === 'vi' ? 'Tổng thanh toán' : 'Total'}</td>
      <td style="padding:12px 0 0;font-size:17px;font-weight:700;text-align:right;border-top:2px solid #e4e4e7;">${fmtMoney(ctx.total, locale)}</td>
    </tr>
  `)

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${rows.join('')}</table>`
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

function orderDetailsBody(ctx: OrderEmailContext, locale: 'en' | 'vi', opts?: { showStaff?: boolean }) {
  const fulfillment =
    ctx.fulfillmentType === 'home'
      ? locale === 'vi'
        ? 'Giao tại nhà'
        : 'Home delivery'
      : locale === 'vi'
        ? 'Nhận tại cửa hàng'
        : 'Store pickup'

  const paymentLabel =
    ctx.paymentStatus === 'completed'
      ? locale === 'vi'
        ? 'Đã thanh toán'
        : 'Paid'
      : ctx.paymentMethod === 'payos'
        ? locale === 'vi'
          ? 'Chờ thanh toán PayOS'
          : 'Awaiting PayOS payment'
        : ctx.paymentMethod === 'pending_staff'
          ? locale === 'vi'
            ? 'Thanh toán khi xác nhận'
            : 'Pay after confirmation'
          : null

  return `
    <p style="margin:0 0 12px;">${locale === 'vi' ? 'Mã đơn' : 'Order'}: <strong>#${escapeHtml(ctx.orderId.slice(0, 8))}</strong></p>
    <p style="margin:0 0 12px;">${locale === 'vi' ? 'Hình thức' : 'Type'}: <strong>${fulfillment}</strong></p>
    <p style="margin:0 0 12px;">${locale === 'vi' ? 'Thời gian nhận/giao' : 'Scheduled time'}: <strong>${fmtDate(ctx.scheduledAt, locale)}</strong></p>
    ${
      paymentLabel
        ? `<p style="margin:0 0 12px;">${locale === 'vi' ? 'Thanh toán' : 'Payment'}: <strong>${paymentLabel}</strong></p>`
        : ''
    }
    ${
      ctx.fulfillmentType === 'home' && ctx.deliveryAddress
        ? `<p style="margin:0 0 12px;">${locale === 'vi' ? 'Giao đến' : 'Deliver to'}: <strong>${escapeHtml(ctx.deliveryAddress)}</strong>${ctx.deliveryPhone ? `<br/><span style="font-size:14px;color:#52525b;">${locale === 'vi' ? 'Điện thoại' : 'Phone'}: ${escapeHtml(ctx.deliveryPhone)}</span>` : ''}</p>`
        : ''
    }
    ${
      ctx.prepScheduledAt
        ? `<p style="margin:0 0 12px;font-size:14px;color:#71717a;">${
            locale === 'vi'
              ? `Shop chuẩn bị từ: ${fmtDate(ctx.prepScheduledAt, locale)}`
              : `We start preparing at: ${fmtDate(ctx.prepScheduledAt, locale)}`
          }${opts?.showStaff && ctx.staffName ? ` · ${escapeHtml(ctx.staffName)}` : ''}</p>`
        : ''
    }
    <div style="margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:600;">${locale === 'vi' ? 'Sản phẩm' : 'Items'}</p>
      ${itemsTable(ctx.items, locale)}
    </div>
    <div style="margin:16px 0;padding:16px;background:#fafafa;border-radius:8px;">
      <p style="margin:0 0 8px;font-weight:600;">${locale === 'vi' ? 'Chi tiết thanh toán' : 'Payment summary'}</p>
      ${orderTotalsTable(ctx, locale)}
    </div>
    ${
      ctx.fulfillmentType === 'home' && ctx.paymentMethod === 'pending_staff'
        ? `<p style="margin:16px 0 0;font-size:14px;color:#52525b;">${
            locale === 'vi'
              ? 'Nhân viên có thể liên hệ để xác nhận giá hoa nếu cần.'
              : 'Our team may contact you to confirm flower pricing if needed.'
          }</p>`
        : ''
    }
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
    ${orderDetailsBody(ctx, 'en', { showStaff: true })}
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
    ${orderDetailsBody(ctx, 'en', { showStaff: true })}
  `
  return {
    subject: `⏰ Prep in 1h — order #${ctx.orderId.slice(0, 8)}`,
    html: emailShell({ title, bodyHtml: body, preheader: title }),
  }
}

