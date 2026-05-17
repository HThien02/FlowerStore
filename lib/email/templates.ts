import { getEmailLayout } from './layout'

export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  deliveryCost: number
  total: number
  deliveryAddress?: string
  deliveryTime?: string
  locale?: 'en' | 'vi'
}

const translations = {
  en: {
    orderConfirmation: 'Order Confirmation',
    paymentSuccess: 'Payment Successful',
    deliveryReminder: 'Your Flowers Will Arrive Soon',
    cancellation: 'Order Cancelled',
    staffAssignment: 'New Delivery Order Assigned',
    adminNotification: 'New Order Received',
    orderNumber: 'Order Number',
    date: 'Date',
    items: 'Items',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    total: 'Total',
    orderDetails: 'Order Details',
    thankYou: 'Thank you for your order!',
    trackOrder: 'Track Your Order',
    needHelp: 'Need help?',
    contactUs: 'Contact us at support@flowerstore.com',
    deliveryIn1Hour: 'Your flowers will arrive in about 1 hour from now',
    staffAssignmentText: 'You have been assigned a new delivery order',
    adminNotificationText: 'A new order has been received and is pending',
  },
  vi: {
    orderConfirmation: 'Xác Nhận Đơn Hàng',
    paymentSuccess: 'Thanh Toán Thành Công',
    deliveryReminder: 'Hoa Của Bạn Sắp Đến',
    cancellation: 'Đơn Hàng Đã Hủy',
    staffAssignment: 'Giao Việc Giao Hàng Mới',
    adminNotification: 'Đơn Hàng Mới Được Nhận',
    orderNumber: 'Số Đơn Hàng',
    date: 'Ngày',
    items: 'Sản Phẩm',
    subtotal: 'Tạm Tính',
    delivery: 'Giao Hàng',
    total: 'Tổng Cộng',
    orderDetails: 'Chi Tiết Đơn Hàng',
    thankYou: 'Cảm ơn bạn đã đặt hàng!',
    trackOrder: 'Theo Dõi Đơn Hàng',
    needHelp: 'Cần giúp đỡ?',
    contactUs: 'Liên hệ support@flowerstore.com',
    deliveryIn1Hour: 'Hoa của bạn sẽ đến trong khoảng 1 tiếng từ bây giờ',
    staffAssignmentText: 'Bạn đã được giao một đơn hàng giao hàng mới',
    adminNotificationText: 'Một đơn hàng mới đã được nhận và đang chờ xử lý',
  },
}

type TranslationKey = keyof typeof translations.en

function t(locale: 'en' | 'vi' = 'en', key: TranslationKey): string {
  return translations[locale][key] || translations.en[key]
}

export function generateOrderConfirmationEmail(data: OrderEmailData & { locale?: 'en' | 'vi' }): string {
  const locale = data.locale || 'en'
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  const content = `
    <h2 style="color: #e75480; margin-bottom: 20px;">${t(locale, 'orderConfirmation')}</h2>
    <p style="margin-bottom: 20px;">${t(locale, 'thankYou')}</p>
    
    <div style="background: #f9f0f3; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #e75480; margin-top: 0;">${t(locale, 'orderDetails')}</h3>
      <p><strong>${t(locale, 'orderNumber')}:</strong> ${data.orderId}</p>
      <p><strong>${t(locale, 'date')}:</strong> ${new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</p>
      ${data.deliveryTime ? `<p><strong>Delivery Time:</strong> ${data.deliveryTime}</p>` : ''}
      ${data.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>` : ''}
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #fff0f3;">
          <th style="padding: 10px; text-align: left; color: #e75480;">${t(locale, 'items')}</th>
          <th style="padding: 10px; color: #e75480;">Qty</th>
          <th style="padding: 10px; text-align: right; color: #e75480;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right;"><strong>${t(locale, 'subtotal')}:</strong></td>
          <td style="padding: 10px; text-align: right;">$${data.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 10px; text-align: right;"><strong>${t(locale, 'delivery')}:</strong></td>
          <td style="padding: 10px; text-align: right;">$${data.deliveryCost.toFixed(2)}</td>
        </tr>
        <tr style="background: #fff0f3;">
          <td colspan="2" style="padding: 10px; text-align: right;"><strong style="color: #e75480;">${t(locale, 'total')}:</strong></td>
          <td style="padding: 10px; text-align: right; color: #e75480; font-weight: bold;">$${data.total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <p>${t(locale, 'needHelp')} ${t(locale, 'contactUs')}</p>
  `

  return getEmailLayout(content, data.customerName)
}

export function generatePaymentSuccessEmail(data: OrderEmailData & { locale?: 'en' | 'vi' }): string {
  const locale = data.locale || 'en'
  const content = `
    <h2 style="color: #10b981; margin-bottom: 20px;">${t(locale, 'paymentSuccess')}</h2>
    <p style="margin-bottom: 20px;">Payment for your order <strong>#${data.orderId}</strong> has been successfully processed.</p>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
      <p style="color: #10b981; margin: 0;">✓ ${t(locale, 'trackOrder')}</p>
    </div>

    <p>${t(locale, 'needHelp')} ${t(locale, 'contactUs')}</p>
  `

  return getEmailLayout(content, data.customerName)
}

export function generateDeliveryReminderEmail(data: OrderEmailData & { deliveryTime?: string; locale?: 'en' | 'vi' }): string {
  const locale = data.locale || 'en'
  const content = `
    <h2 style="color: #f59e0b; margin-bottom: 20px;">${t(locale, 'deliveryReminder')}</h2>
    <p style="margin-bottom: 20px;">${t(locale, 'deliveryIn1Hour')}</p>
    
    <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <p><strong>Order #:</strong> ${data.orderId}</p>
      ${data.deliveryTime ? `<p><strong>Expected Delivery:</strong> ${data.deliveryTime}</p>` : ''}
      ${data.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>` : ''}
    </div>

    <p>Please ensure someone is available to receive the flowers. ${t(locale, 'contactUs')}</p>
  `

  return getEmailLayout(content, data.customerName)
}

export function generateCancellationEmail(data: OrderEmailData & { reason?: string; locale?: 'en' | 'vi' }): string {
  const locale = data.locale || 'en'
  const content = `
    <h2 style="color: #ef4444; margin-bottom: 20px;">${t(locale, 'cancellation')}</h2>
    <p style="margin-bottom: 20px;">Your order <strong>#${data.orderId}</strong> has been cancelled.</p>
    
    ${data.reason ? `<div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;"><p><strong>Reason:</strong> ${data.reason}</p></div>` : ''}

    <p>${t(locale, 'needHelp')} ${t(locale, 'contactUs')}</p>
  `

  return getEmailLayout(content, data.customerName)
}

export function generateStaffAssignmentEmail(data: {
  staffName: string
  staffEmail: string
  orderId: string
  customerName: string
  deliveryAddress: string
  deliveryTime: string
  items: Array<{ name: string; quantity: number }>
  locale?: 'en' | 'vi'
}): string {
  const locale = data.locale || 'en'
  const itemsHtml = data.items.map((item) => `<li>${item.name} (x${item.quantity})</li>`).join('')

  const content = `
    <h2 style="color: #8b5cf6; margin-bottom: 20px;">${t(locale, 'staffAssignment')}</h2>
    <p style="margin-bottom: 20px;">${t(locale, 'staffAssignmentText')}</p>
    
    <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #8b5cf6; margin-top: 0;">Order Details</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
      <p><strong>Scheduled Time:</strong> ${data.deliveryTime}</p>
      
      <h4 style="color: #8b5cf6;">Items to Deliver:</h4>
      <ul style="margin-bottom: 0;">
        ${itemsHtml}
      </ul>
    </div>

    <p>Please confirm receipt of this assignment and complete the delivery as scheduled.</p>
  `

  return getEmailLayout(content, data.staffName)
}

export function generateAdminNotificationEmail(data: {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  total: number
  items: Array<{ name: string; quantity: number }>
  locale?: 'en' | 'vi'
}): string {
  const locale = data.locale || 'en'
  const itemsHtml = data.items.map((item) => `<li>${item.name} (x${item.quantity})</li>`).join('')

  const content = `
    <h2 style="color: #3b82f6; margin-bottom: 20px;">${t(locale, 'adminNotification')}</h2>
    <p>${t(locale, 'adminNotificationText')}</p>
    
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #3b82f6; margin-top: 0;">Order Information</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Customer Name:</strong> ${data.customerName}</p>
      <p><strong>Customer Email:</strong> ${data.customerEmail}</p>
      <p><strong>Customer Phone:</strong> ${data.customerPhone}</p>
      <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
      <p><strong>Total Amount:</strong> $${data.total.toFixed(2)}</p>
      
      <h4 style="color: #3b82f6;">Items Ordered:</h4>
      <ul style="margin-bottom: 0;">
        ${itemsHtml}
      </ul>
    </div>

    <p><strong>Action Required:</strong> Please schedule staff and confirm delivery time.</p>
  `

  return getEmailLayout(content, 'Admin')
}
