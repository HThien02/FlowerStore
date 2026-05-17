import { NextRequest, NextResponse } from 'next/server'
import { createPayosCheckoutForOrder } from '@/lib/orders/payos-payment'
import { isPayOSConfigured } from '@/lib/payos'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!isPayOSConfigured()) {
    return NextResponse.json({ error: 'PayOS is not configured' }, { status: 503 })
  }

  try {
    const { orderId, locale } = await request.json()
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const admin = getSupabaseServerClient()
    const result = await createPayosCheckoutForOrder(
      admin,
      orderId,
      locale === 'vi' ? 'vi' : 'en'
    )

    return NextResponse.json(result)
  } catch (e: unknown) {
    console.error('[payos/create-link]', e)
    const msg = e instanceof Error ? e.message : 'Failed to create payment link'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
