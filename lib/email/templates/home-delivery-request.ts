import { escapeHtml } from '../escape-html'
import { emailShell } from '../layout'
import { formatMoney } from '@/lib/pricing/currency'

export type LineItem = {
  productName?: string
  quantity?: number
  price?: number
}

export type HomeDeliveryForm = {
  deliveryInfo: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    notes?: string
  }
  items: LineItem[]
  subtotal?: number
}

const brand = () => process.env.EMAIL_BRAND_NAME || 'Flower Shop'

/** Email gửi cho khách sau khi gửi yêu cầu giao tại nhà. */
export function homeDeliveryCustomerEmail(
  locale: 'en' | 'vi',
  data: HomeDeliveryForm
): { subject: string; html: string } {
  const { deliveryInfo, items, subtotal } = data
  const name = `${deliveryInfo.firstName ?? ''} ${deliveryInfo.lastName ?? ''}`.trim()
  const subVnd = Number(subtotal ?? 0)

  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">${escapeHtml(String(i.productName ?? ''))}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;text-align:center;">${i.quantity ?? 0}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;text-align:right;">${formatMoney(Number(i.price ?? 0) * (i.quantity ?? 1), locale)}</td>
        </tr>`
    )
    .join('')

  if (locale === 'vi') {
    const body = `
      <p>Xin chào ${escapeHtml(name || deliveryInfo.email || 'bạn')},</p>
      <p>Cảm ơn bạn đã gửi <strong>yêu cầu giao hàng tại nhà</strong>.</p>
      <p style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;margin:20px 0;">
        <strong>Nhân viên sẽ liên hệ bạn trong vòng 1 giờ</strong> để xác nhận địa chỉ, thời gian và giá cuối.
      </p>
      <p style="margin-top:24px;font-weight:600;color:#18181b;">Địa chỉ giao hàng</p>
      <p style="margin:0;">${escapeHtml([deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode, deliveryInfo.country].filter(Boolean).join(', '))}</p>
      <p style="margin:8px 0 0;"><strong>Điện thoại:</strong> ${escapeHtml(deliveryInfo.phone ?? '')}</p>
      ${deliveryInfo.notes ? `<p style="margin-top:12px;"><strong>Ghi chú:</strong> ${escapeHtml(deliveryInfo.notes)}</p>` : ''}
      <p style="margin-top:24px;font-weight:600;color:#18181b;">Sản phẩm</p>
      <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:8px;font-size:14px;">
        <thead>
          <tr style="background:#fafafa;">
            <th align="left" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Sản phẩm</th>
            <th style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">SL</th>
            <th align="right" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Đơn giá</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px;"><strong>Tạm tính:</strong> ${formatMoney(subVnd, 'vi')}</p>
      <p style="margin-top:24px;font-size:13px;color:#71717a;">Đây là email tự động. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua.</p>
    `
    return {
      subject: `Đã nhận yêu cầu giao hàng — ${brand()}`,
      html: emailShell({
        title: 'Chúng tôi đã nhận yêu cầu của bạn',
        preheader: 'Nhân viên sẽ liên hệ trong 1 giờ.',
        bodyHtml: body,
        brandName: brand(),
      }),
    }
  }

  const body = `
    <p>Hi ${escapeHtml(name || deliveryInfo.email || 'there')},</p>
    <p>Thank you for your <strong>home delivery request</strong>.</p>
    <p style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;margin:20px 0;">
      <strong>A team member will contact you within 1 hour</strong> to confirm address, time, and final pricing.
    </p>
    <p style="margin-top:24px;font-weight:600;color:#18181b;">Delivery address</p>
    <p style="margin:0;">${escapeHtml([deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode, deliveryInfo.country].filter(Boolean).join(', '))}</p>
    <p style="margin:8px 0 0;"><strong>Phone:</strong> ${escapeHtml(deliveryInfo.phone ?? '')}</p>
    ${deliveryInfo.notes ? `<p style="margin-top:12px;"><strong>Notes:</strong> ${escapeHtml(deliveryInfo.notes)}</p>` : ''}
    <p style="margin-top:24px;font-weight:600;color:#18181b;">Items</p>
    <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:8px;font-size:14px;">
      <thead>
        <tr style="background:#fafafa;">
          <th align="left" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Product</th>
          <th style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Qty</th>
          <th align="right" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;"><strong>Subtotal:</strong> ${formatMoney(subVnd, 'en')}</p>
    <p style="margin-top:24px;font-size:13px;color:#71717a;">This is an automated message. If you did not submit this request, you can ignore this email.</p>
  `
  return {
    subject: `We received your delivery request — ${brand()}`,
    html: emailShell({
      title: 'We received your request',
      preheader: 'Our team will contact you within one hour.',
      bodyHtml: body,
      brandName: brand(),
    }),
  }
}

/** Email nội bộ / cửa hàng khi có yêu cầu giao tại nhà. */
export function homeDeliveryStaffEmail(data: HomeDeliveryForm): { subject: string; html: string } {
  const { deliveryInfo, items, subtotal } = data
  const subVnd = Number(subtotal ?? 0)

  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e4e4e7;">${escapeHtml(String(i.productName ?? ''))}</td>
          <td style="padding:8px;border-bottom:1px solid #e4e4e7;">${i.quantity ?? 0}</td>
          <td style="padding:8px;border-bottom:1px solid #e4e4e7;text-align:right;">${formatMoney(Number(i.price ?? 0) * (i.quantity ?? 1), 'vi')}</td>
        </tr>`
    )
    .join('')

  const body = `
    <p><strong>Khách:</strong> ${escapeHtml(`${deliveryInfo.firstName ?? ''} ${deliveryInfo.lastName ?? ''}`.trim())}</p>
    <p><strong>Email:</strong> ${escapeHtml(deliveryInfo.email ?? '')}</p>
    <p><strong>Điện thoại:</strong> ${escapeHtml(deliveryInfo.phone ?? '')}</p>
    <p><strong>Địa chỉ:</strong> ${escapeHtml([deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode, deliveryInfo.country].filter(Boolean).join(', '))}</p>
    ${deliveryInfo.notes ? `<p><strong>Ghi chú:</strong> ${escapeHtml(deliveryInfo.notes)}</p>` : ''}
    <p style="margin-top:16px;font-weight:600;">Sản phẩm</p>
    <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      <thead><tr style="background:#fafafa;"><th align="left" style="padding:8px;">Sản phẩm</th><th style="padding:8px;">SL</th><th align="right" style="padding:8px;">Giá</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:12px;"><strong>Tạm tính:</strong> ${formatMoney(subVnd, 'vi')}</p>
  `

  return {
    subject: `[${brand()}] Yêu cầu giao tại nhà — ${escapeHtml(deliveryInfo.email ?? '')}`,
    html: emailShell({
      title: 'Yêu cầu giao hàng tại nhà (mới)',
      bodyHtml: body,
      brandName: brand(),
    }),
  }
}
