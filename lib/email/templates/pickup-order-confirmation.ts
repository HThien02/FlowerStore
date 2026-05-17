import { escapeHtml } from '../escape-html'
import { emailShell } from '../layout'
import { formatMoney } from '@/lib/pricing/currency'

/** Dùng sau khi khách đặt nhận tại cửa hàng & thanh toán (gọi từ API hoặc review step). */
export type PickupOrderForm = {
  customerName: string
  email: string
  phone?: string
  orderRef?: string
  items: Array<{ name: string; quantity: number; lineTotal: number }>
  total: number
  paymentLabel?: string
}

const brand = () => process.env.EMAIL_BRAND_NAME || 'Flower Shop'

export function pickupOrderConfirmationEmail(
  locale: 'en' | 'vi',
  data: PickupOrderForm
): { subject: string; html: string } {
  const rows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">${escapeHtml(i.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;text-align:center;">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;text-align:right;">${formatMoney(i.lineTotal, locale)}</td>
        </tr>`
    )
    .join('')

  if (locale === 'vi') {
    const body = `
      <p>Xin chào ${escapeHtml(data.customerName)},</p>
      <p>Cảm ơn bạn đã đặt hàng <strong>nhận tại cửa hàng</strong>.</p>
      ${data.orderRef ? `<p><strong>Mã tham chiếu:</strong> ${escapeHtml(data.orderRef)}</p>` : ''}
      ${data.paymentLabel ? `<p><strong>Thanh toán:</strong> ${escapeHtml(data.paymentLabel)}</p>` : ''}
      <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
        <thead><tr style="background:#fafafa;"><th align="left" style="padding:10px 12px;">Sản phẩm</th><th>SL</th><th align="right">Tạm tính</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px;font-size:18px;font-weight:700;">Tổng: ${formatMoney(data.total, 'vi')}</p>
      <p>Vui lòng đến cửa hàng theo giờ làm việc để nhận hoa. Mang theo mã đơn hoặc email này nếu cần.</p>
    `
    return {
      subject: `Xác nhận đơn nhận tại cửa hàng — ${brand()}`,
      html: emailShell({ title: 'Đơn hàng của bạn', bodyHtml: body, brandName: brand() }),
    }
  }

  const body = `
    <p>Hi ${escapeHtml(data.customerName)},</p>
    <p>Thank you for your <strong>in-store pickup</strong> order.</p>
    ${data.orderRef ? `<p><strong>Reference:</strong> ${escapeHtml(data.orderRef)}</p>` : ''}
    ${data.paymentLabel ? `<p><strong>Payment:</strong> ${escapeHtml(data.paymentLabel)}</p>` : ''}
    <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
      <thead><tr style="background:#fafafa;"><th align="left" style="padding:10px 12px;">Product</th><th>Qty</th><th align="right">Line</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:18px;font-weight:700;">Total: ${formatMoney(data.total, 'en')}</p>
    <p>Please visit our store during opening hours to collect your order.</p>
  `
  return {
    subject: `Pickup order confirmation — ${brand()}`,
    html: emailShell({ title: 'Your order', bodyHtml: body, brandName: brand() }),
  }
}
