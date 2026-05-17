import { NextRequest, NextResponse } from 'next/server'
import { getAppBaseUrl, isPayOSConfigured } from '@/lib/payos'
import { resolveOrderIdForPayosReturn } from '@/lib/orders/payos-return'
import { syncPayosOrderPayment } from '@/lib/orders/payos-payment'
import { getSupabaseServerClient } from '@/lib/supabase'

/**
 * PayOS redirect về đây sau khi thanh toán (returnUrl).
 * Đồng bộ trạng thái rồi chuyển tiếp sang trang order-success.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const locale = sp.get('locale') === 'vi' ? 'vi' : 'en'
  const orderIdParam = sp.get('orderId')
  const orderCodeParam = sp.get('orderCode')

  const admin = getSupabaseServerClient()
  const orderId = await resolveOrderIdForPayosReturn(admin, {
    orderId: orderIdParam,
    orderCode: orderCodeParam,
  })

  if (orderId && isPayOSConfigured()) {
    try {
      await syncPayosOrderPayment(admin, orderId)
    } catch (e) {
      console.error('[payos/return] sync', orderId, e)
    }
  }

  const base = getAppBaseUrl()
  const out = new URL(`${base}/${locale}/order-success`)
  if (orderId) out.searchParams.set('orderId', orderId)
  out.searchParams.set('payos', '1')

  for (const key of ['code', 'status', 'orderCode', 'id', 'cancel'] as const) {
    const v = sp.get(key)
    if (v) out.searchParams.set(key, v)
  }

  return NextResponse.redirect(out.toString(), 302)
}
