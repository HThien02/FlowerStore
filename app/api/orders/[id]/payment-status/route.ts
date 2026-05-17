import { NextRequest, NextResponse } from 'next/server'
import { syncPayosOrderPayment } from '@/lib/orders/payos-payment'
import { isPayOSConfigured } from '@/lib/payos'
import { getSupabaseServerClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

/**
 * Poll trạng thái thanh toán sau khi quay từ PayOS.
 * ?sync=1 — gọi PayOS API để cập nhật đơn nếu webhook chưa tới.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
  }

  const sync = request.nextUrl.searchParams.get('sync') === '1'

  try {
    const admin = getSupabaseServerClient()

    if (sync && isPayOSConfigured()) {
      const result = await syncPayosOrderPayment(admin, id)
      return NextResponse.json({
        payment_status: result.payment_status,
        synced: result.synced,
        payos_status: result.payosStatus,
        amount: result.amount,
        amountPaid: result.amountPaid,
        amountRemaining: result.amountRemaining,
      })
    }

    const { data, error } = await admin
      .from('orders')
      .select('payment_status, payos_order_code')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      payment_status: data.payment_status,
      has_payos_code: data.payos_order_code != null,
    })
  } catch (e) {
    console.error('[orders/payment-status]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
