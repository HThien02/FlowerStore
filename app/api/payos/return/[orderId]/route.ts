import { NextRequest, NextResponse } from 'next/server'
import { getAppBaseUrl, isPayOSConfigured } from '@/lib/payos'
import { syncPayosOrderPayment } from '@/lib/orders/payos-payment'
import { getSupabaseServerClient } from '@/lib/supabase'

type Params = { params: Promise<{ orderId: string }> }

/** PayOS redirect về đây (returnUrl). Path-based để tránh lỗi query khi PayOS append params. */
export async function GET(request: NextRequest, { params }: Params) {
  const { orderId } = await params
  const sp = request.nextUrl.searchParams
  const locale = sp.get('locale') === 'vi' ? 'vi' : 'en'
  const orderCodeParam = sp.get('orderCode')
  const descriptionParam = sp.get('description')

  if (isPayOSConfigured()) {
    try {
      const admin = getSupabaseServerClient()
      let syncOrderId = orderId
      if (!syncOrderId) {
        const { resolveOrderIdForPayosReturn } = await import('@/lib/orders/payos-return')
        syncOrderId =
          (await resolveOrderIdForPayosReturn(admin, {
            orderCode: orderCodeParam,
            description: descriptionParam,
          })) ?? undefined
      }
      if (syncOrderId) {
        await syncPayosOrderPayment(admin, syncOrderId)
      }
    } catch (e) {
      console.error('[payos/return] sync', orderId, e)
    }
  }

  const base = getAppBaseUrl()
  const out = new URL(`${base}/${locale}/order-success`)
  if (orderId) out.searchParams.set('orderId', orderId)
  out.searchParams.set('payos', '1')

  for (const key of ['code', 'status', 'orderCode', 'id', 'cancel'] as const) {
    const v = sp.get(key) ?? (key === 'orderCode' ? orderCodeParam : null)
    if (v) out.searchParams.set(key, v)
  }

  console.info('[payos/return] redirect', orderId, out.toString())
  return NextResponse.redirect(out.toString(), 302)
}
