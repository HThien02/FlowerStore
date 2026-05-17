import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

/** Public read: payment status only (for order-success polling after PayOS return). */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
  }

  try {
    const admin = getSupabaseServerClient()
    const { data, error } = await admin
      .from('orders')
      .select('payment_status')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ payment_status: data.payment_status })
  } catch (e) {
    console.error('[orders/payment-status]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
