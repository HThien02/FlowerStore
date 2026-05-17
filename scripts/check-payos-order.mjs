/**
 * Kiểm tra trạng thái link PayOS theo orderId (UUID) trong Supabase.
 * Usage: node --env-file=.env.local scripts/check-payos-order.mjs <orderId>
 */
import { createClient } from '@supabase/supabase-js'
import { PayOS } from '@payos/node'

const orderId = process.argv[2]
if (!orderId) {
  console.error('Usage: node --env-file=.env.local scripts/check-payos-order.mjs <orderId>')
  process.exit(1)
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
})

const { data: order, error } = await admin
  .from('orders')
  .select('id, total, payment_status, payos_order_code, payos_payment_link_id, created_at')
  .eq('id', orderId)
  .single()

if (error || !order) {
  console.error('Order not found:', error?.message)
  process.exit(1)
}

console.log('Order:', {
  id: order.id,
  total_vnd: order.total,
  payment_status: order.payment_status,
  payos_order_code: order.payos_order_code,
  payos_payment_link_id: order.payos_payment_link_id,
})

if (!order.payos_order_code) {
  console.log('No payos_order_code on this order.')
  process.exit(0)
}

try {
  const link = await payos.paymentRequests.get(Number(order.payos_order_code))
  console.log('\nPayOS link:', {
    status: link.status,
    amount: link.amount,
    amountPaid: link.amountPaid,
    amountRemaining: link.amountRemaining,
    description: link.description,
    orderCode: link.orderCode,
    checkoutUrl: link.checkoutUrl,
  })
  if (link.status === 'PENDING' && Number(link.amountPaid) > 0) {
    console.log('\n⚠ Tiền đã vào một phần nhưng chưa PAID — có thể sai số tiền hoặc nội dung CK.')
  }
  if (link.status === 'PENDING' && Number(link.amountPaid) === 0) {
    console.log(
      '\n⚠ PayOS chưa khớp giao dịch. Nguyên nhân thường gặp:\n' +
        '  - Chuyển tay (không quét QR) hoặc sai nội dung chuyển khoản\n' +
        '  - Số tiền không khớp link\n' +
        '  - TK ngân hàng chưa liên kết đối soát tự động trên my.payos.vn\n' +
        '  → Liên hệ PayOS support với orderCode:', link.orderCode
    )
  }
} catch (e) {
  console.error('PayOS API error:', e.message)
  process.exit(1)
}
