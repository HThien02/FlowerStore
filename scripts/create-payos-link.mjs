/**
 * Tạo (hoặc tạo lại) link PayOS cho đơn đã có nhưng payos_order_code = null.
 * Usage: node --env-file=.env.local scripts/create-payos-link.mjs <orderId-uuid> [vi|en]
 */
import { createClient } from '@supabase/supabase-js'
import { PayOS } from '@payos/node'

const orderId = process.argv[2]
const locale = process.argv[3] === 'en' ? 'en' : 'vi'

if (!orderId) {
  console.error('Usage: node --env-file=.env.local scripts/create-payos-link.mjs <orderId-uuid> [vi|en]')
  process.exit(1)
}

const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
})

function generatePayosOrderCode() {
  return Math.floor(100_000 + Math.random() * 900_000)
}

function payosDescription(orderCode) {
  const code = String(orderCode).replace(/\D/g, '').slice(-6)
  return `VQRIO${code}`
}

const { data: order, error } = await admin
  .from('orders')
  .select('id, total, payment_status, payos_order_code')
  .eq('id', orderId)
  .maybeSingle()

if (error || !order) {
  console.error('Order not found:', error?.message)
  process.exit(1)
}

if (order.payment_status === 'completed') {
  console.log('Order already paid.')
  process.exit(0)
}

const amount = Math.max(Math.round(Number(order.total)), 1000)
const orderCode = generatePayosOrderCode()
const description = payosDescription(orderCode)
const returnUrl = `${base}/${locale}/order-success?orderId=${encodeURIComponent(orderId)}&payos=1`
const cancelUrl = `${base}/${locale}/checkout?cancelled=1`

console.log('Creating PayOS link…', { orderId, amount, orderCode, description })

const { error: preErr } = await admin
  .from('orders')
  .update({
    payos_order_code: orderCode,
    payment_method: 'payos',
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId)

if (preErr) {
  console.error('DB update failed (run scripts/setup-payos.sql?):', preErr.message)
  process.exit(1)
}

let link
try {
  const { data: rows } = await admin
    .from('order_items')
    .select('product_name, quantity, product_price')
    .eq('order_id', orderId)

  let items = (rows ?? []).map((r) => ({
    name: String(r.product_name || 'Sản phẩm').slice(0, 120),
    quantity: Math.max(1, Number(r.quantity) || 1),
    price: Math.round(Number(r.product_price) || 0),
  }))
  const sum = items.reduce((s, i) => s + i.price * i.quantity, 0)
  if (!items.length || sum !== amount) {
    items = [{ name: 'Đơn hàng TFlowers', quantity: 1, price: amount }]
  }

  link = await payos.paymentRequests.create({
    orderCode,
    amount,
    description,
    items,
    returnUrl,
    cancelUrl,
  })
} catch (e) {
  await admin.from('orders').update({ payos_order_code: null }).eq('id', orderId)
  console.error('PayOS API error:', e.message)
  process.exit(1)
}

await admin
  .from('orders')
  .update({
    payos_payment_link_id: link.paymentLinkId,
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId)

console.log('\nOK — open this URL to pay:')
console.log(link.checkoutUrl)
console.log('\nSaved:', {
  payos_order_code: orderCode,
  payos_payment_link_id: link.paymentLinkId,
  amount: link.amount ?? amount,
})
