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
    provinceCode?: string
    provinceName?: string
    districtCode?: string
    districtName?: string
    wardCode?: string
    wardName?: string
  }
  items: LineItem[]
  subtotal?: number
  deliveryCost?: number
  afterHoursFee?: number
  total?: number
}

const brand = () => process.env.EMAIL_BRAND_NAME || 'Flower Shop'

function formatAddress(deliveryInfo: HomeDeliveryForm['deliveryInfo']) {
  if (deliveryInfo.wardName || deliveryInfo.provinceName) {
    return [
      deliveryInfo.address,
      deliveryInfo.wardName,
      deliveryInfo.districtName,
      deliveryInfo.provinceName,
    ]
      .filter(Boolean)
      .join(', ')
  }
  return [deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode, deliveryInfo.country]
    .filter(Boolean)
    .join(', ')
}

function totalsBlock(
  locale: 'en' | 'vi',
  data: HomeDeliveryForm
) {
  const subtotal = Number(data.subtotal ?? 0)
  const deliveryCost = Number(data.deliveryCost ?? 0)
  const afterHoursFee = Number(data.afterHoursFee ?? 0)
  const total = Number(data.total ?? subtotal + deliveryCost + afterHoursFee)
  const farNote = data.deliveryInfo.notes?.includes('Giao xa >20km')

  let deliveryLine: string
  if (deliveryCost > 0) {
    deliveryLine = fmtRow(
      locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee',
      formatMoney(deliveryCost, locale),
      locale
    )
  } else if (farNote) {
    deliveryLine = fmtRow(
      locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee',
      locale === 'vi' ? 'Nhân viên báo sau' : 'Quoted by staff',
      locale,
      true
    )
  } else {
    deliveryLine = fmtRow(
      locale === 'vi' ? 'Phí giao hàng' : 'Delivery fee',
      locale === 'vi' ? 'Miễn phí' : 'Free',
      locale
    )
  }

  const afterHoursRow =
    afterHoursFee > 0
      ? fmtRow(
          locale === 'vi' ? 'Phụ thu ngoài giờ (10%)' : 'After-hours surcharge (10%)',
          `+${formatMoney(afterHoursFee, locale)}`,
          locale,
          true
        )
      : ''

  return `
    <div style="margin-top:16px;padding:16px;background:#fafafa;border-radius:8px;">
      <p style="margin:0 0 8px;font-weight:600;">${locale === 'vi' ? 'Chi tiết thanh toán' : 'Payment summary'}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        ${fmtRow(locale === 'vi' ? 'Tạm tính sản phẩm' : 'Subtotal', formatMoney(subtotal, locale), locale)}
        ${deliveryLine}
        ${afterHoursRow}
        <tr>
          <td style="padding:12px 0 0;font-weight:700;border-top:2px solid #e4e4e7;">${locale === 'vi' ? 'Tổng tạm tính' : 'Estimated total'}</td>
          <td style="padding:12px 0 0;font-weight:700;text-align:right;border-top:2px solid #e4e4e7;">${formatMoney(total, locale)}</td>
        </tr>
      </table>
    </div>
  `
}

function fmtRow(label: string, value: string, locale: 'en' | 'vi', accent = false) {
  const color = accent ? '#b45309' : '#52525b'
  return `<tr>
    <td style="padding:6px 0;color:${color};">${label}</td>
    <td style="padding:6px 0;text-align:right;color:${accent ? '#b45309' : 'inherit'};">${value}</td>
  </tr>`
}

/** Email gửi cho khách sau khi gửi yêu cầu giao tại nhà. */
export function homeDeliveryCustomerEmail(
  locale: 'en' | 'vi',
  data: HomeDeliveryForm
): { subject: string; html: string } {
  const { deliveryInfo, items } = data
  const name = `${deliveryInfo.firstName ?? ''} ${deliveryInfo.lastName ?? ''}`.trim()

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

  const address = formatAddress(deliveryInfo)

  if (locale === 'vi') {
    const body = `
      <p>Xin chào ${escapeHtml(name || deliveryInfo.email || 'bạn')},</p>
      <p>Cảm ơn bạn đã gửi <strong>yêu cầu giao hàng tại nhà</strong>. Chúng tôi đã ghi nhận đơn của bạn.</p>
      <p style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;margin:20px 0;">
        <strong>Nhân viên sẽ liên hệ bạn trong vòng 1 giờ</strong> nếu cần xác nhận thêm chi tiết.
      </p>
      <p style="margin-top:24px;font-weight:600;color:#18181b;">Địa chỉ giao hàng</p>
      <p style="margin:0;">${escapeHtml(address)}</p>
      <p style="margin:8px 0 0;"><strong>Điện thoại:</strong> ${escapeHtml(deliveryInfo.phone ?? '')}</p>
      ${deliveryInfo.notes ? `<p style="margin-top:12px;"><strong>Ghi chú:</strong> ${escapeHtml(deliveryInfo.notes)}</p>` : ''}
      <p style="margin-top:24px;font-weight:600;color:#18181b;">Sản phẩm</p>
      <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:8px;font-size:14px;">
        <thead>
          <tr style="background:#fafafa;">
            <th align="left" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Sản phẩm</th>
            <th style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">SL</th>
            <th align="right" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${totalsBlock('vi', data)}
      <p style="margin-top:20px;font-size:13px;color:#71717a;">Nếu bạn không gửi yêu cầu này, vui lòng liên hệ cửa hàng.</p>
    `
    return {
      subject: `Đã nhận yêu cầu giao hàng — ${brand()}`,
      html: emailShell({
        title: 'Chúng tôi đã nhận yêu cầu của bạn',
        preheader: 'Chi tiết đơn hàng và phí giao hàng trong email.',
        bodyHtml: body,
        brandName: brand(),
      }),
    }
  }

  const body = `
    <p>Hi ${escapeHtml(name || deliveryInfo.email || 'there')},</p>
    <p>Thank you for your <strong>home delivery request</strong>. We have recorded your order.</p>
    <p style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;margin:20px 0;">
      <strong>Our team may contact you within 1 hour</strong> if we need to confirm any details.
    </p>
    <p style="margin-top:24px;font-weight:600;color:#18181b;">Delivery address</p>
    <p style="margin:0;">${escapeHtml(address)}</p>
    <p style="margin:8px 0 0;"><strong>Phone:</strong> ${escapeHtml(deliveryInfo.phone ?? '')}</p>
    ${deliveryInfo.notes ? `<p style="margin-top:12px;"><strong>Notes:</strong> ${escapeHtml(deliveryInfo.notes)}</p>` : ''}
    <p style="margin-top:24px;font-weight:600;color:#18181b;">Items</p>
    <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:8px;font-size:14px;">
      <thead>
        <tr style="background:#fafafa;">
          <th align="left" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Product</th>
          <th style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Qty</th>
          <th align="right" style="padding:10px 12px;border-bottom:1px solid #e4e4e7;">Line total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${totalsBlock('en', data)}
    <p style="margin-top:20px;font-size:13px;color:#71717a;">If you did not submit this request, please contact our shop.</p>
  `
  return {
    subject: `We received your delivery request — ${brand()}`,
    html: emailShell({
      title: 'We received your request',
      preheader: 'Order details and delivery fee are in this email.',
      bodyHtml: body,
      brandName: brand(),
    }),
  }
}

/** Email nội bộ khi có yêu cầu giao tại nhà. */
export function homeDeliveryStaffEmail(data: HomeDeliveryForm): { subject: string; html: string } {
  const { deliveryInfo, items } = data
  const address = formatAddress(deliveryInfo)

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
    <p><strong>Địa chỉ:</strong> ${escapeHtml(address)}</p>
    ${deliveryInfo.notes ? `<p><strong>Ghi chú:</strong> ${escapeHtml(deliveryInfo.notes)}</p>` : ''}
    <table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-top:12px;">
      <thead><tr style="background:#fafafa;"><th align="left" style="padding:8px;">Sản phẩm</th><th style="padding:8px;">SL</th><th align="right" style="padding:8px;">Giá</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${totalsBlock('vi', data)}
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
